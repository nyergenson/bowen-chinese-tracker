
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const allowedFields = [
  'pinyin',
  'english',
  'word_type',
  'lesson_introduced',
  'listening_level',
  'speaking_level',
  'recall_level',
  'review_priority',
  'notes',
] as const;

export async function GET(req: NextRequest) {
  const noCache = { 'Cache-Control': 'no-store' };
  const reply = (body: object, status = 200) =>
    NextResponse.json(body, { status, headers: noCache });

  const token = req.nextUrl.searchParams.get('token');
  const expected = process.env.BOWEN_WRITE_TOKEN;

  if (!expected || !token || token !== expected) {
    return reply({ error: 'Unauthorized' }, 401);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ownerId = process.env.BOWEN_OWNER_ID;

  if (!url || !key || !ownerId) {
    return reply({ error: 'Server not configured' }, 500);
  }

  const raw = req.nextUrl.searchParams.get('data');
  if (!raw || raw.length > 12000) {
    return reply({ error: 'Missing or oversized data' }, 400);
  }

  let words: unknown;

  try {
    words = JSON.parse(raw);
  } catch {
    return reply({ error: 'Invalid JSON' }, 400);
  }

  if (!Array.isArray(words) || words.length < 1 || words.length > 30) {
    return reply({ error: 'Expected 1 to 30 words' }, 400);
  }

  const valid = words.every(
    (word) =>
      word &&
      typeof word === 'object' &&
      !Array.isArray(word) &&
      typeof word.hanzi === 'string' &&
      word.hanzi.trim().length > 0 &&
      word.hanzi.length <= 100 &&
      Object.entries(word).every(
        ([field, value]) =>
          (field === 'hanzi' || allowedFields.includes(field as typeof allowedFields[number])) &&
          (typeof value === 'string' || value === null) &&
          (value === null || value.length <= 1000)
      )
  );

  if (!valid) {
    return reply({ error: 'Invalid vocabulary data' }, 400);
  }

  const admin = createClient(url, key, {
    auth: { persistSession: false },
  });

  const results = [];

  for (const word of words as Record<string, string | null>[]) {
    const hanzi = word.hanzi!.trim();

    const { data: existing, error: lookupError } = await admin
      .from('vocabulary')
      .select('id')
      .eq('owner_id', ownerId)
      .eq('hanzi', hanzi)
      .maybeSingle();

    if (lookupError) {
      return reply({ error: lookupError.message }, 500);
    }

    const fields = Object.fromEntries(
      allowedFields
        .filter((field) => Object.prototype.hasOwnProperty.call(word, field))
        .map((field) => [field, word[field]])
    );

    if (existing) {
      const { error } = await admin
        .from('vocabulary')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .eq('owner_id', ownerId);

      if (error) return reply({ error: error.message }, 500);

      results.push({ hanzi, action: 'updated' });
    } else {
      const { error } = await admin
        .from('vocabulary')
        .insert({
          owner_id: ownerId,
          hanzi,
          ...fields,
        });

      if (error) return reply({ error: error.message }, 500);

      results.push({ hanzi, action: 'added' });
    }
  }

  return reply({ success: true, results });
}
