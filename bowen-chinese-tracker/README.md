# Bowen's Chinese Tracker

A small Next.js + Supabase app for tracking Mandarin vocabulary, listening/speaking/recall proficiency, and sentence patterns.

## Current MVP features
- Private email/password sign-in through Supabase Auth.
- Add, edit, delete, and filter vocabulary.
- Track listening, speaking, and recall separately.
- Track review priority and lesson introduced.
- Track sentence patterns separately.
- Export JSON for ChatGPT and import updated JSON after a lesson.
- Read-only API endpoint protected by a long random token.

## Important integration limitation
A normal ChatGPT Free conversation cannot call arbitrary authenticated APIs or submit POST requests. The app therefore includes a safe copy/paste sync flow. The read-only endpoint can be opened by a web-enabled ChatGPT session when its URL is supplied. The API is structured so a direct integration can be added later if an eligible connector/tool path becomes available.

## Setup
1. Create a Supabase project on the Free plan.
2. In Supabase, open SQL Editor and run `supabase-schema.sql`.
3. In Supabase Project Settings > API, copy the Project URL and anon/publishable key. Copy the service-role key for server use only.
4. Copy `.env.example` to `.env.local` and fill in the values. Generate a long random `BOWEN_READ_TOKEN` (at least 32 random characters). Create your first account, then copy its user UUID from Supabase Authentication > Users into `BOWEN_OWNER_ID`. The read-only endpoint is restricted to that account's records.
5. Install dependencies and run locally:
   ```bash
   npm install
   npm run dev
   ```
6. Deploy the project to Vercel Hobby by importing the Git repository. Add the same environment variables in Vercel Project Settings > Environment Variables.
7. In Supabase Auth settings, configure the Site URL and allowed redirect URLs for the deployed Vercel domain.

## Security notes
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_` variable or in client-side code.
- The read token grants read-only access to the configured owner's vocabulary and sentence patterns. Anyone with the full URL can read that limited data, so keep the URL private and rotate the token if it is shared accidentally.
- Do not put secrets in ChatGPT messages.
- Free Supabase projects can pause after a week of low activity. Data is retained and the project can be restored from the Supabase dashboard.

## Seed data
After creating your account, add the words from the first two lessons:
- 苹果 / píngguǒ / apple
- 熊猫 / xióngmāo / panda
- 球 / qiú / ball
- 吃 / chī / eat
- 看 / kàn / look, see
- 玩 / wán / play
- 我 / wǒ / I, me

Suggested sentence patterns:
- 我吃苹果。 / Wǒ chī píngguǒ. / I eat an apple.
- 我看熊猫。 / Wǒ kàn xióngmāo. / I see a panda.
- 我玩球。 / Wǒ wán qiú. / I play with a ball.

These are lesson-introduced items, not assumed mastered. Assess each skill independently after practicing with Bowen.
