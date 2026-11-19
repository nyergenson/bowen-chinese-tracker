import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const expected = process.env.BOWEN_READ_TOKEN;
  if (!expected || !token || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ownerId = process.env.BOWEN_OWNER_ID;
  if (!url || !serviceKey || !ownerId) return NextResponse.json({ error: 'Server is not configured' }, { status: 500 });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: words, error } = await admin
    .from('vocabulary')
    .select('id,hanzi,pinyin,english,word_type,lesson_introduced,listening_level,speaking_level,recall_level,review_priority,notes,updated_at')
    .eq('owner_id', ownerId)
    .order('hanzi');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: sentences, error: sentenceError } = await admin
    .from('sentences')
    .select('id,hanzi,pinyin,english,lesson_introduced,proficiency,notes')
    .eq('owner_id', ownerId)
    .order('hanzi');
  if (sentenceError) return NextResponse.json({ error: sentenceError.message }, { status: 500 });

  return NextResponse.json({ child: 'Bowen', language: 'Mandarin Chinese', exported_at: new Date().toISOString(), vocabulary: words, sentences }, { headers: { 'Cache-Control': 'no-store' } });
}
