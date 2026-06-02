-- Meeting Summarizer — Supabase schema
-- Run this in the Supabase SQL editor to set up the database from scratch.
-- Users are managed by Supabase Auth (auth.users) — no manual user table needed.

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE meetings (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text        NOT NULL,
  meeting_date date,
  raw_notes    text,
  ai_summary   text,
  ai_decisions text,        -- pipe-delimited string, e.g. "Decision A | Decision B"
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TABLE action_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id  uuid        NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  task        text        NOT NULL,
  owner       text,
  due_date    date,
  is_done     boolean     DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE meetings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their meetings"
  ON meetings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users own their action items"
  ON action_items FOR ALL
  USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE user_id = auth.uid()
    )
  );
