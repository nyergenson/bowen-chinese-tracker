
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const allowedFields = [
  'pinyin',
  'english',
  'word_type',
  'lesson_introduced',
  'notes',
] as const;

const practiceFields = [
  'practiced',
  'needs_extra_practice',
] as const;

type VocabularyWord = {
  hanzi: string;
  practiced?: boolean;
  needs_extra_practice?: boolean;
} & Partial<Record<typeof allowedFields[number], string | null>>;

export async function GET(req: NextRequest) {
  const noCache = {
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'Referrer-Policy': 'no-referrer',
  };

  const reply = (body: object, status = 200) =>
    NextResponse.json(body, {
      status,
      headers: noCache,
    });

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

  const sessionId = req.nextUrl.searchParams
    .get('lesson_session_id')?.trim();

  if (sessionId && sessionId.length > 200) {
    return reply({ error: 'Invalid lesson session ID' }, 400);
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

  if (
    !Array.isArray(words) ||
    words.length < 1 ||
    words.length > 30
  ) {
    return reply({ error: 'Expected 1 to 30 words' }, 400);
  }

  const valid = words.every(
    word =>
      word &&
      typeof word === 'object' &&
      !Array.isArray(word) &&
      typeof word.hanzi === 'string' &&
      word.hanzi.trim().length > 0 &&
      word.hanzi.length <= 100 &&
      Object.entries(word).every(([field, value]) => {
        if (
          practiceFields.includes(
            field as typeof practiceFields[number]
          )
        ) {
          return typeof value === 'boolean';
        }

        if (
          field === 'hanzi' ||
          allowedFields.includes(
            field as typeof allowedFields[number]
          )
        ) {
          return (
            (typeof value === 'string' || value === null) &&
            (value === null || value.length <= 1000)
          );
        }

        return false;
      })
  );

  if (!valid) {
    return reply({ error: 'Invalid vocabulary data' }, 400);
  }

  const vocabularyWords = words as VocabularyWord[];

  const uniqueWords = new Set(
    vocabularyWords.map(word => word.hanzi.trim())
  );

  if (uniqueWords.size !== vocabularyWords.length) {
    return reply({
      error: 'Duplicate words in request',
    }, 400);
  }

  const requiresSession = vocabularyWords.some(
    word => word.practiced || word.needs_extra_practice
  );

  if (requiresSession && !sessionId) {
    return reply({
      error: 'lesson_session_id is required for practice updates',
    }, 400);
  }

  const admin = createClient(url, key, {
    auth: { persistSession: false },
  });

  const results = [];

  for (const word of vocabularyWords) {
    const hanzi = word.hanzi.trim();

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
        .filter(field =>
          Object.prototype.hasOwnProperty.call(word, field)
        )
        .map(field => [field, word[field]])
    );

    let vocabularyId: string;
    let action: string;

    if (existing) {
      vocabularyId = existing.id;
      action = 'existing';

      // Preserve the original lesson introduced.
      delete fields.lesson_introduced;

      if (Object.keys(fields).length > 0) {
        const { error } = await admin
          .from('vocabulary')
          .update({
            ...fields,
            updated_at: new Date().toISOString(),
          })
          .eq('id', vocabularyId)
          .eq('owner_id', ownerId);

        if (error) {
          return reply({ error: error.message }, 500);
        }

        action = 'updated';
      }

    } else {
      // Prevent incomplete vocabulary entries.
      if (
        !word.pinyin?.trim() ||
        !word.english?.trim() ||
        !word.word_type?.trim() ||
        !word.lesson_introduced?.trim()
      ) {
        return reply({
          error: 'New words require pinyin, english, word_type, and lesson_introduced',
          hanzi,
        }, 400);
      }

      const { data: inserted, error } = await admin
        .from('vocabulary')
        .insert({
          owner_id: ownerId,
          hanzi,
          ...fields,
        })
        .select('id')
        .single();

      if (error || !inserted) {
        return reply({
          error: error?.message || 'Unable to add word',
        }, 500);
      }

      vocabularyId = inserted.id;
      action = 'added';
    }

    // Record practice and calculate the review schedule.
    if (word.practiced === true) {
      const { error: practiceError } = await admin.rpc(
        'record_vocabulary_practice',
        {
          p_vocabulary_id: vocabularyId,
          p_lesson_session_id: sessionId!,
          p_needs_extra_practice:
            word.needs_extra_practice === true,
        }
      );

      if (practiceError) {
        return reply({
          error: practiceError.message,
          hanzi,
        }, 500);
      }

    } else if (word.needs_extra_practice === true) {

      // Request extra practice without counting a review.
      const { error: flagError } = await admin
        .from('vocabulary')
        .update({
          review_stage: 0,
          extra_reviews_remaining: 3,
          next_review_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', vocabularyId)
        .eq('owner_id', ownerId);

      if (flagError) {
        return reply({
          error: flagError.message,
          hanzi,
        }, 500);
      }
    }

    // Return the updated practice information.
    const { data: current, error: currentError } = await admin
      .from('vocabulary')
      .select(`
        practice_count,
        last_practiced_at,
        next_review_at,
        review_stage,
        extra_reviews_remaining
      `)
      .eq('id', vocabularyId)
      .eq('owner_id', ownerId)
      .single();

    if (currentError) {
      return reply({ error: currentError.message }, 500);
    }

    results.push({
      hanzi,
      action,
      practice_requested: word.practiced === true,
      extra_practice_requested:
        word.needs_extra_practice === true,
      ...current,
    });
  }

  return reply({
    success: true,
    lesson_session_id: sessionId || null,
    results,
  });
}
