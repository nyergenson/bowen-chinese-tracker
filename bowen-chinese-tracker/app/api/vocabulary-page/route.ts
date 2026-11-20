
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => {
    const replacements: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return replacements[char];
  });
}

export async function GET(request: NextRequest) {
  const headers = {
    'Cache-Control': 'private, no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow',
  };

  const token = request.nextUrl.searchParams.get('token');

  if (!process.env.BOWEN_READ_TOKEN ||
      token !== process.env.BOWEN_READ_TOKEN) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const owner = process.env.BOWEN_OWNER_ID;

  if (!url || !key || !owner) {
    return NextResponse.json(
      { error: 'Server not configured' },
      { status: 500, headers }
    );
  }

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('vocabulary')
    .select('hanzi, pinyin, english, lesson_introduced, listening_level, speaking_level, recall_level')
    .eq('owner_id', owner)
    .order('hanzi');

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers }
    );
  }

  const rows = (data ?? []).map(word =>
    `<tr>
      <td>${escapeHtml(word.hanzi)}</td>
      <td>${escapeHtml(word.pinyin)}</td>
      <td>${escapeHtml(word.english)}</td>
      <td>${escapeHtml(word.lesson_introduced)}</td>
      <td>${escapeHtml(word.listening_level)}</td>
      <td>${escapeHtml(word.speaking_level)}</td>
      <td>${escapeHtml(word.recall_level)}</td>
    </tr>`
  ).join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow">
  <title>Bowen's Chinese Vocabulary</title>
</head>
<body>
  <h1>Bowen's Chinese Vocabulary</h1>
  <p>Total words: ${(data ?? []).length}</p>
  <table border="1" cellpadding="8">
    <thead>
      <tr>
        <th>Chinese</th>
        <th>Pinyin</th>
        <th>English</th>
        <th>Lesson</th>
        <th>Listening</th>
        <th>Speaking</th>
        <th>Recall</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      ...headers,
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
