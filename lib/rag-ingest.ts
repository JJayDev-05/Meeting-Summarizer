import type { SupabaseClient } from '@supabase/supabase-js'
import { embed, chunkText } from './embeddings'

type MeetingLike = {
  id: string
  user_id: string
  title?: string | null
  raw_notes?: string | null
  ai_summary?: string | null
}

// Embed a meeting's text into the meeting_chunks table for RAG search.
// Safe to call repeatedly: it clears the meeting's old chunks first, so edits
// (and re-runs of the backfill) re-index cleanly without duplicates.
export async function indexMeeting(supabase: SupabaseClient, meeting: MeetingLike) {
  // Always clear old chunks first
  await supabase.from('meeting_chunks').delete().eq('meeting_id', meeting.id)

  const text = [meeting.title, meeting.ai_summary, meeting.raw_notes]
    .filter(Boolean)
    .join('\n\n')

  const chunks = chunkText(text)
  if (chunks.length === 0) return

  const rows = []
  for (const content of chunks) {
    const embedding = await embed(content)
    rows.push({
      meeting_id: meeting.id,
      user_id: meeting.user_id,
      content,
      embedding,
    })
  }

  const { error } = await supabase.from('meeting_chunks').insert(rows)
  if (error) throw new Error(error.message)
}
