-- Run this in Supabase Dashboard > SQL Editor.
-- Tables are private to authenticated users. The API route uses a separate server-only read token.
create extension if not exists pgcrypto;

create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  hanzi text not null,
  pinyin text not null,
  english text not null,
  word_type text not null default 'noun',
  lesson_introduced text not null default 'Lesson 1',
  listening_level text not null default 'not_assessed',
  speaking_level text not null default 'not_assessed',
  recall_level text not null default 'not_assessed',
  review_priority text not null default 'normal',
  notes text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(owner_id, hanzi)
);

create table if not exists public.sentences (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  hanzi text not null,
  pinyin text not null,
  english text not null,
  lesson_introduced text not null default 'Lesson 1',
  proficiency text not null default 'not_assessed',
  notes text,
  created_at timestamptz not null default now(),
  unique(owner_id, hanzi)
);

alter table public.vocabulary enable row level security;
alter table public.sentences enable row level security;

drop policy if exists "Users manage their own vocabulary" on public.vocabulary;
create policy "Users manage their own vocabulary" on public.vocabulary
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "Users manage their own sentences" on public.sentences;
create policy "Users manage their own sentences" on public.sentences
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create index if not exists vocabulary_owner_idx on public.vocabulary(owner_id);
create index if not exists sentences_owner_idx on public.sentences(owner_id);
