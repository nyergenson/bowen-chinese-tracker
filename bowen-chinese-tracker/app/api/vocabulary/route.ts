
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'Referrer-Policy': 'no-referrer',
  };

  const reply = (body: object, status = 200) =>
    NextResponse.json(body, { status, headers });

  const token = req.nextUrl.searchParams.get('token');
  const expected = process.env.BOWEN_READ_TOKEN;

  if (!expected || !token || token !== expected) {
    return reply({ error: 'Unauthorized' }, 401);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ownerId = process.env.BOWEN_OWNER_ID;

  if (!url || !serviceKey || !ownerId) {
    return reply({ error: 'Server is not configured' }, 500);
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: words, error } = await admin
    .from('vocabulary')
    .select(`
      id,
      hanzi,
      pinyin,
      english,
      word_type,
      lesson_introduced,
      practice_count,
      last_practiced_at,
      next_review_at,
      review_stage,
      extra_reviews_remaining,
      notes,
      updated_at
    `)
    .eq('owner_id', ownerId)
    .order('hanzi');

  if (error) {
    return reply({ error: error.message }, 500);
  }

  const { data: sentences, error: sentenceError } = await admin
    .from('sentences')
    .select(`
      id,
      hanzi,
      pinyin,
      english,
      lesson_introduced,
      proficiency,
      notes
    `)
    .eq('owner_id', ownerId)
    .order('hanzi');

  if (sentenceError) {
    return reply({ error: sentenceError.message }, 500);
  }

  const now = new Date();
  const nowMs = now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  const vocabulary = (words || []).map(word => {
    const nextReviewMs = word.next_review_at
      ? new Date(word.next_review_at).getTime()
      : null;

    const reviewDue =
      word.extra_reviews_remaining > 0 ||
      word.practice_count === 0 ||
      nextReviewMs === null ||
      nextReviewMs <= nowMs;

    const daysOverdue =
      nextReviewMs === null
        ? null
        : Math.max(
            0,
            Math.floor((nowMs - nextReviewMs) / dayMs)
          );

    return {
      ...word,
      review_due: reviewDue,
      days_overdue: daysOverdue,
    };
  });

  // Put the highest-priority review words first.
  vocabulary.sort((a, b) => {
    const extraA = a.extra_reviews_remaining > 0 ? 1 : 0;
    const extraB = b.extra_reviews_remaining > 0 ? 1 : 0;

    if (extraA !== extraB) {
      return extraB - extraA;
    }

    if (a.review_due !== b.review_due) {
      return Number(b.review_due) - Number(a.review_due);
    }

    const dateA = a.next_review_at
      ? new Date(a.next_review_at).getTime()
      : 0;

    const dateB = b.next_review_at
      ? new Date(b.next_review_at).getTime()
      : 0;

    return dateA - dateB ||
      a.hanzi.localeCompare(b.hanzi, 'zh');
  });

  return reply({
    child: 'Bowen',
    language: 'Mandarin Chinese',
    exported_at: now.toISOString(),

    summary: {
      total_words: vocabulary.length,
      words_due_for_review: vocabulary.filter(
        word => word.review_due
      ).length,
      words_needing_extra_practice: vocabulary.filter(
        word => word.extra_reviews_remaining > 0
      ).length,
      words_without_recorded_practice: vocabulary.filter(
        word => word.practice_count === 0
      ).length,
      total_word_practices: vocabulary.reduce(
        (total, word) => total + word.practice_count,
        0
      ),
    },

    vocabulary,
    sentences,
  });
}
