export type Meeting = {
  id: string
  user_id: string
  title: string
  meeting_date: string | null
  raw_notes: string | null
  ai_summary: string | null
  ai_decisions: string | null
  created_at: string
  updated_at: string
  action_items?: ActionItem[]
}

export type ActionItem = {
  id: string
  meeting_id: string
  task: string
  owner: string | null
  due_date: string | null
  is_done: boolean
  created_at: string
}