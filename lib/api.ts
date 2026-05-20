// lib/api.ts — all API calls in one place

export async function getMeetings() {
  const res = await fetch('/api/meetings')
  if (!res.ok) throw new Error('Failed to fetch meetings')
  return res.json()
}

export async function createMeeting(data: {
  title: string
  meeting_date?: string | null
  raw_notes?: string
  ai_summary?: string
  ai_decisions?: string
  action_items?: { task: string; owner: string }[]
}) {
  const res = await fetch('/api/meetings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create meeting')
  return res.json()
}

export async function deleteMeeting(id: string) {
  const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete meeting')
  return res.json()
}

export async function summarizeMeeting(notes: string) {
  const res = await fetch('/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  })
  if (!res.ok) throw new Error('Failed to summarize')
  return res.json()
}