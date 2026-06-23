-- Meeting Summarizer — RAG ("Ask your meetings") schema
-- Run this in the Supabase SQL editor AFTER schema.sql.
-- Embeddings come from Google Gemini text-embedding-004 (768 dimensions).

-- 1. Enable pgvector
create extension if not exists vector;

-- 2. Chunks table — one row per embedded slice of a meeting's text
create table meeting_chunks (
  id          uuid        primary key default gen_random_uuid(),
  meeting_id  uuid        not null references meetings(id)   on delete cascade,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  content     text        not null,
  embedding   vector(768),
  created_at  timestamptz default now()
);

-- 3. Approximate-nearest-neighbour index for fast similarity search.
--    HNSW needs no training and works well on small datasets.
create index on meeting_chunks using hnsw (embedding vector_cosine_ops);

-- 4. Row Level Security — users can only see/search their own chunks
alter table meeting_chunks enable row level security;

create policy "Users own their meeting chunks"
  on meeting_chunks for all
  using (auth.uid() = user_id);

-- 5. Similarity search. SECURITY INVOKER (default) so auth.uid() is the caller,
--    meaning a user can only ever match their own chunks.
create or replace function match_meeting_chunks (
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  id uuid,
  meeting_id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    mc.id,
    mc.meeting_id,
    mc.content,
    1 - (mc.embedding <=> query_embedding) as similarity
  from meeting_chunks mc
  where mc.user_id = auth.uid()
  order by mc.embedding <=> query_embedding
  limit match_count;
$$;
