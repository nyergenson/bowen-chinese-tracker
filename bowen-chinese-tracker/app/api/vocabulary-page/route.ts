
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, char => {
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

function formatDate(value: string | null): string {
  if (!value) return '—';

  return new Date(value).toLocaleDateString('en-US', {
    timeZone: 'America/Boise',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const lessonInstructions = `
# Bowen's Mandarin Chinese Lessons

## Student and learning goals

Bowen is a 4-year-old (Born March 2022) child learning Mandarin Chinese.

Focus on listening comprehension, speaking, pronunciation,
and developing an intuitive understanding of Chinese.

Do not teach reading or writing Chinese characters unless
the parent specifically requests it.

Make lessons enjoyable, playful, interactive, and appropriate
for a preschool-aged child.

The long-term goal is to gradually increase the amount of
Chinese Bowen understands and speaks naturally.

The supplied vocabulary data contains previously introduced
words, their practice history, and their review schedules.

## Preparing a lesson

When these instructions and vocabulary data are provided:

1. Review the current vocabulary and practice information.
2. Determine the next lesson number from previously
   introduced vocabulary.
3. Choose approximately three useful new Chinese words.
4. Choose existing words that need review.
5. Prepare an entertaining story incorporating these words.
6. Briefly tell the parent what the lesson will cover.
7. Wait for the parent to indicate that Bowen is ready
   before beginning the interactive lesson.

Do not begin teaching immediately when these instructions
are pasted into the conversation.

Avoid introducing vocabulary that already exists in the
database as new vocabulary.

Choose practical, common words that can be combined with
previously introduced words to form natural expressions.

## Selecting vocabulary for review

Use the following priority order:

1. Words with extra_reviews_remaining greater than zero.
2. Previously introduced words with no recorded practice.
3. Words that are due or overdue for scheduled review.
4. Recently introduced words that benefit from reinforcement.
5. Occasionally include older vocabulary for continued exposure.

Use review_due and days_overdue to help select words.

Inform the parent if there are more overdue words than can be 
reviewed in one session

Aim to review approximately 4 to 8 existing words per
lesson, depending on Bowen's attention and the story.

When practical, include 1 or 2 older words even if they
are not currently due for review.

Do not try to review every overdue word in a single lesson
if the vocabulary list becomes large.

Rotate through overdue words across multiple lessons.

Words with zero recorded practices may have been taught
before practice tracking was implemented. Treat them as
review vocabulary, not necessarily unfamiliar words.

## Lesson structure

A complete lesson should last approximately 20 minutes.

The duration is a flexible target, not a strict timer.

### Part 1: Warm-up and review — 3 minutes

Greet Bowen warmly.

Review a few previously introduced words.

Use simple questions, guessing games, or playful prompts.

Give Bowen opportunities to say words aloud.

### Part 2: Introduce new vocabulary — 4 minutes

Introduce approximately three new words.

For each word:

- Say the Chinese word clearly.
- Explain its meaning in simple English.
- Give Bowen an opportunity to repeat it.
- Repeat the word naturally 2 or 3 times.
- Use a short example or playful association.

Teach one new word at a time.

Do not overwhelm Bowen with a long list of vocabulary.

### Part 3: Interactive story — 8 minutes

The story is the central part of the lesson.

Create a genuinely entertaining children's story, not a
sequence of vocabulary practice sentences disguised as
a story.

The story should have:

- Interesting characters.
- A clear beginning.
- An adventure, mystery, problem, or goal.
- Several connected events.
- Humor, surprises, or suspense.
- A satisfying ending.

Use imaginative topics such as animals, dinosaurs, robots,
treasure hunts, vehicles, magical adventures, or funny
situations.

Vary the story topics between lessons.

Use English narration as the foundation at Bowen's
current level.

Naturally substitute familiar Chinese words and short
Chinese expressions into the story.

Include all three newly introduced words and selected
review vocabulary.

Repeat target vocabulary naturally throughout the story.

For example, instead of repeatedly asking Bowen to say
the word for dog, tell an adventure in which a 狗 finds
a mysterious 球, follows clues, and meets a 熊猫.

Introduce the meanings of unfamiliar expressions when
needed so Bowen can follow the story.

Occasionally pause the story to ask Bowen to:

- Repeat an important Chinese word.
- Guess what happens next.
- Answer a simple question.
- Choose between two possibilities.
- Help a character solve a problem.

Do not interrupt every sentence with a vocabulary question.

Allow the story to develop naturally and remain enjoyable.

Do not rush through the story or end it after only a few
sentences. Develop several meaningful events.

As Bowen's vocabulary grows, gradually increase the
amount of Mandarin used in narration and dialogue.

Use natural Mandarin grammar when speaking complete
Chinese phrases or sentences.

Do not suddenly switch to full Chinese if that would make
the story difficult for Bowen to understand.

### Part 4: Practice games — 3 minutes

Use simple interactive games to reinforce the vocabulary.

Examples include:

- Guess the animal.
- Choose the correct Chinese word.
- Pretend to act out a word.
- Find an imaginary object.
- Translate a short phrase.
- Help a story character remember a word.

Combine newly introduced words with existing vocabulary.

### Part 5: Final review — 2 minutes

Review the three new words and several important words
from the lesson.

End with encouragement and a positive conclusion.

## Interactive teaching behavior

These lessons will often be conducted using voice mode.

Speak directly to Bowen using simple, age-appropriate
language.

Whenever asking Bowen to respond, ask one question or
give one instruction at a time.

Pause and wait for an actual response.

Never pretend Bowen answered when he has not.

Do not automatically say that an answer was correct
unless an answer was actually received and understood.

If a response is unclear, gently repeat the word or
question and continue.

The parent may help Bowen respond or may choose not
to provide feedback.

Do not repeatedly ask the parent to evaluate Bowen's
performance.

Keep the lesson moving naturally.

Be enthusiastic without using excessive praise.

Adapt to Bowen's attention span and the parent's
instructions.

If the parent asks to continue the story, continue
developing the story rather than immediately moving
to the final review.

Do not prematurely end a lesson unless the parent
requests it or the lesson is genuinely complete.

IMPORTANT: Always pronounce Chinese words with a 
standard Mandarin accent, not an American accent. 
Make sure to pronounce the tones as a native 
speaker would

## Practice tracking

Vocabulary tracking is based on exposure and practice,
not demonstrated mastery.

Do not estimate or record listening proficiency,
speaking proficiency, or successful recall.

The parent generally will not provide performance
feedback.

Record a word as practiced if it was meaningfully
introduced, reviewed, repeated, taught through the
story, or used in a practice activity during the lesson.

An incidental mention alone does not necessarily count
as meaningful practice.

Track which words were actually practiced, rather than
only which words were included in the lesson plan.

Count each word once per lesson, regardless of how many
times the word was repeated.

If a lesson ends early, record only the words actually
introduced or practiced.

Multiple separate lessons on the same day are allowed.

Practice counts do not represent mastery.

## Spaced repetition

The database automatically schedules reviews using
increasing intervals:

1, 2, 4, 7, 14, 30, and 60 days.

Practicing a word before its scheduled review increases
its practice count without advancing its normal review
stage or postponing its scheduled review date.

Do not calculate or manually submit practice_count,
last_practiced_at, next_review_at, review_stage, or
extra_reviews_remaining.

The database handles these automatically.

If the parent explicitly says Bowen needs more practice
with a particular word, flag that word using
needs_extra_practice: true.

This schedules three additional practice sessions.

Do not flag words for extra practice based on assumptions
about Bowen's ability.

Additional practice may be requested during or outside
a lesson.

## End-of-lesson database update

At the end of every completed or partially completed lesson,
provide a brief summary containing:

- New words actually introduced.
- Existing words actually practiced.
- Any words explicitly requested for extra practice.
- A clickable link to save these changes to the database.

Do not only describe what should be saved.

Generate the actual clickable update link.

The parent will click the link to perform the update.

Do not claim the database has been updated until the
parent confirms the update succeeded.

## Database update API

Endpoint:

https://bowen-chinese-tracker.vercel.app/api/update-vocabulary

Write token:

bowen

HTTP method:

GET

Query parameters:

- token
- lesson_session_id
- data

The data parameter must contain a URL-encoded JSON array.

For each new lesson, generate a unique lesson_session_id.

Use a timestamp and a random suffix or a UUID to make
the session identifier unique.

Reuse the same session identifier if regenerating a
link for the same lesson.

Generate a different identifier for each separate lesson,
including lessons on the same day.

The database prevents duplicate practice counts using
the lesson session identifier and vocabulary word.

### Existing word practiced

{
  "hanzi": "苹果",
  "practiced": true
}

### Newly introduced word

{
  "hanzi": "水",
  "pinyin": "shuǐ",
  "english": "water",
  "word_type": "noun",
  "lesson_introduced": "Lesson 4",
  "practiced": true
}

Use the actual current lesson number instead of the
example lesson number.

### Word practiced and requested for extra practice

{
  "hanzi": "球",
  "practiced": true,
  "needs_extra_practice": true
}

### Extra practice requested without actual practice

{
  "hanzi": "球",
  "needs_extra_practice": true
}

Do not record practice that did not occur.

### Optional notes

The notes field can store useful observations explicitly
provided by the parent.

Do not invent observations or assessment results.

Preserve existing notes when adding new information.

### Constructing the update link

Combine all relevant word objects into one JSON array.

Include each word only once.

Include no more than 30 words in a request.

The decoded JSON must be no longer than 12000 characters.

URL-encode the complete JSON array.

The link format is:

https://bowen-chinese-tracker.vercel.app/api/update-vocabulary?token=bowen&lesson_session_id=SESSION_ID&data=ENCODED_JSON

Replace SESSION_ID and ENCODED_JSON with their actual
values.

Return a regular clickable Markdown link:

[Save Bowen's lesson to the vocabulary database](ACTUAL_URL)

Do not leave placeholders in the link.

Do not provide only JSON, a code block, or a custom
interface button.

The clickable link must contain the complete actual URL.

Do not execute the update link yourself.

Do not invent new vocabulary or practice activity merely
to populate the update request.

## Important

The primary goal is for Bowen to enjoy learning Chinese.

The story should feel like a children's story with
Chinese learning incorporated naturally, rather than
a formal vocabulary drill.

Use the database to improve lesson continuity and
vocabulary exposure over time.

The vocabulary data below is the current source of truth
for previously introduced vocabulary and review scheduling.
`.trim();

type Word = {
  hanzi: string;
  pinyin: string;
  english: string;
  word_type: string;
  lesson_introduced: string;
  practice_count: number;
  last_practiced_at: string | null;
  next_review_at: string | null;
  review_stage: number;
  extra_reviews_remaining: number;
  review_due: boolean;
  days_overdue: number | null;
  notes: string | null;
};

export async function GET(request: NextRequest) {
  const headers = {
    'Cache-Control': 'private, no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow',
  };

  const token = request.nextUrl.searchParams.get('token');

  if (
    !process.env.BOWEN_READ_TOKEN ||
    token !== process.env.BOWEN_READ_TOKEN
  ) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers }
    );
  }

  // Retrieve the latest vocabulary export.
  const exportUrl = new URL(
    'https://bowen-chinese-tracker.vercel.app/api/vocabulary'
  );

  exportUrl.searchParams.set('token', token);

  let data;

  try {
    const response = await fetch(exportUrl.toString(), {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Unable to retrieve vocabulary');
    }

    data = await response.json();

  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : 'Vocabulary export failed',
      },
      { status: 500, headers }
    );
  }

  const words: Word[] = data.vocabulary ?? [];
  const summary = data.summary ?? {};

  const vocabularyJson = JSON.stringify(data, null, 2);

  const fullPrompt =
    lessonInstructions +
    '\n\n# Current Vocabulary Data\n\n' +
    vocabularyJson;

  const rows = words.map(word => {
    let status = 'Scheduled';
    let statusClass = 'scheduled';

    if (word.extra_reviews_remaining > 0) {
      status = 'Extra practice';
      statusClass = 'extra';

    } else if (word.practice_count === 0) {
      status = 'Not tracked';
      statusClass = 'due';

    } else if (word.review_due) {
      status = 'Due';
      statusClass = 'due';
    }

    return `
      <tr>
        <td class="hanzi">${escapeHtml(word.hanzi)}</td>
        <td>${escapeHtml(word.pinyin)}</td>
        <td>${escapeHtml(word.english)}</td>
        <td>${escapeHtml(word.word_type)}</td>
        <td>${escapeHtml(word.lesson_introduced)}</td>
        <td class="number">${word.practice_count}</td>
        <td>${formatDate(word.last_practiced_at)}</td>
        <td>${formatDate(word.next_review_at)}</td>
        <td>
          <span class="status ${statusClass}">
            ${status}
          </span>
        </td>
        <td class="number">${word.extra_reviews_remaining}</td>
        <td>${escapeHtml(word.notes || '—')}</td>
      </tr>`;
  }).join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport"
        content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">

  <title>Bowen's Chinese Learning Dashboard</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      font-family: system-ui, -apple-system,
        BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #202938;
      background: #f4f6f9;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }

    main {
      max-width: 1450px;
      margin: auto;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 30px;
    }

    h2 {
      margin-top: 0;
      font-size: 21px;
    }

    .subtitle {
      color: #667085;
      margin-top: 0;
    }

    .panel {
      background: white;
      border: 1px solid #e0e5ec;
      border-radius: 12px;
      padding: 22px;
      margin-bottom: 22px;
    }

    .buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 18px;
    }

    button {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      background: white;
      color: #334155;
      cursor: pointer;
      padding: 13px 20px;
      font-size: 15px;
      font-weight: 600;
    }

    button.primary {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }

    button:hover {
      filter: brightness(0.95);
    }

    #copy-message {
      min-height: 24px;
      margin: 10px 0 0;
      color: #15803d;
      font-weight: 600;
    }

    .stats {
      display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(150px, 1fr));
      gap: 14px;
      margin-bottom: 22px;
    }

    .stat {
      background: white;
      border: 1px solid #e0e5ec;
      border-radius: 12px;
      padding: 18px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
    }

    .stat-label {
      font-size: 13px;
      color: #667085;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      background: #f1f5f9;
      white-space: nowrap;
      font-size: 12px;
      color: #475569;
    }

    tr:hover td {
      background: #fafbfc;
    }

    .hanzi {
      font-size: 23px;
      font-weight: 600;
      white-space: nowrap;
    }

    .number {
      text-align: center;
      font-variant-numeric: tabular-nums;
    }

    .status {
      padding: 4px 9px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .extra {
      color: #b91c1c;
      background: #fee2e2;
    }

    .due {
      color: #92400e;
      background: #fef3c7;
    }

    .scheduled {
      color: #166534;
      background: #dcfce7;
    }

    details {
      margin-top: 12px;
    }

    summary {
      cursor: pointer;
      font-weight: 600;
    }

    pre {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      background: #f8fafc;
      padding: 18px;
      border-radius: 8px;
      font-family: inherit;
      font-size: 14px;
    }

    textarea {
      width: 100%;
      min-height: 220px;
      padding: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      resize: vertical;
      font-size: 13px;
    }

    .small {
      font-size: 13px;
      color: #667085;
    }

    @media (max-width: 600px) {
      body {
        padding: 12px;
      }

      .panel {
        padding: 16px;
      }

      h1 {
        font-size: 24px;
      }

      button {
        width: 100%;
      }
    }
  </style>
</head>

<body>
<main>

  <h1>Bowen's Chinese Learning Dashboard</h1>

  <p class="subtitle">
    Mandarin vocabulary, lesson preparation,
    and spaced repetition.
  </p>

  <section class="panel">
    <h2>Prepare a new lesson</h2>

    <p>
      Copy the teaching instructions and current vocabulary,
      then paste them into any AI assistant to prepare
      Bowen's next Chinese lesson.
    </p>

    <div class="buttons">
      <button class="primary"
              onclick="copyContent('full-prompt')">
        Copy Instructions + Vocabulary
      </button>

      <button onclick="copyContent('vocabulary-json')">
        Copy Vocabulary JSON
      </button>

      <button onclick="copyContent('instructions-only')">
        Copy Instructions Only
      </button>

      <button onclick="location.reload()">
        Refresh Data
      </button>
    </div>

    <p id="copy-message" role="status"></p>

    <p class="small">
      After a lesson, click the update link generated by
      the AI, then refresh this page.
    </p>

    <textarea id="full-prompt" hidden>${escapeHtml(fullPrompt)}</textarea>

    <textarea id="instructions-only" hidden>${escapeHtml(lessonInstructions)}</textarea>
  </section>

  <section class="stats">

    <div class="stat">
      <div class="stat-value">
        ${summary.total_words ?? words.length}
      </div>
      <div class="stat-label">Total words</div>
    </div>

    <div class="stat">
      <div class="stat-value">
        ${summary.words_due_for_review ?? 0}
      </div>
      <div class="stat-label">Due for review</div>
    </div>

    <div class="stat">
      <div class="stat-value">
        ${summary.words_needing_extra_practice ?? 0}
      </div>
      <div class="stat-label">Extra practice requested</div>
    </div>

    <div class="stat">
      <div class="stat-value">
        ${summary.words_without_recorded_practice ?? 0}
      </div>
      <div class="stat-label">Without recorded practice</div>
    </div>

    <div class="stat">
      <div class="stat-value">
        ${summary.total_word_practices ?? 0}
      </div>
      <div class="stat-label">Total word practices</div>
    </div>

  </section>

  <section class="panel">
    <h2>Vocabulary and review schedule</h2>

    <p class="small">
      Words needing extra practice and scheduled reviews
      appear first. Practice counts measure exposure,
      not mastery.
    </p>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Chinese</th>
            <th>Pinyin</th>
            <th>English</th>
            <th>Type</th>
            <th>Lesson</th>
            <th>Practices</th>
            <th>Last practiced</th>
            <th>Next review</th>
            <th>Status</th>
            <th>Extra reviews</th>
            <th>Notes</th>
          </tr>
        </thead>

        <tbody>${rows}</tbody>

      </table>
    </div>
  </section>

  <section class="panel">
    <h2>AI lesson instructions</h2>

    <details>
      <summary>View complete teaching instructions</summary>

      <pre>${escapeHtml(lessonInstructions)}</pre>
    </details>
  </section>

  <section class="panel">
    <h2>Raw vocabulary data</h2>

    <details>
      <summary>View vocabulary JSON</summary>

      <textarea id="vocabulary-json"
                readonly>${escapeHtml(vocabularyJson)}</textarea>
    </details>
  </section>

  <p class="small">
    Data exported:
    ${escapeHtml(data.exported_at)}
  </p>

</main>

<script>
  async function copyContent(id) {
    const field = document.getElementById(id);
    const message = document.getElementById('copy-message');

    try {
      await navigator.clipboard.writeText(field.value);

      message.textContent =
        'Copied successfully! Paste into your AI assistant.';

      message.style.color = '#15803d';

    } catch (error) {
      const temp = document.createElement('textarea');
      temp.value = field.value;

      document.body.appendChild(temp);
      temp.select();

      let copied = false;

      try {
        copied = document.execCommand('copy');
      } catch (error) {
        copied = false;
      }

      temp.remove();

      message.textContent = copied
        ? 'Copied successfully!'
        : 'Unable to copy. Please copy the text manually.';

      message.style.color = copied
        ? '#15803d'
        : '#b91c1c';

      if (!copied) {
        const manual = document.createElement('textarea');
        manual.value = field.value;
        manual.readOnly = true;
        message.after(manual);
        manual.select();
      }
    }
  }
</script>

</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      ...headers,
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
