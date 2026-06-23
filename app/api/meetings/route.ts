import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { indexMeeting } from '@/lib/rag-ingest'

async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('meetings')
    .select(`*, action_items (*)`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, meeting_date, raw_notes, ai_summary, ai_decisions, action_items } = body

  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({
      user_id: user.id,
      title,
      meeting_date: meeting_date || null,
      raw_notes: raw_notes || null,
      ai_summary: ai_summary || null,
      ai_decisions: ai_decisions || null,
    })
    .select()
    .single()

  if (meetingError) return NextResponse.json({ error: meetingError.message }, { status: 500 })

  if (action_items && action_items.length > 0) {
    const { error: itemsError } = await supabase
      .from('action_items')
      .insert(
        action_items.map((item: { task: string; owner: string }) => ({
          meeting_id: meeting.id,
          task: item.task,
          owner: item.owner || null,
          is_done: false,
        }))
      )
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }

  // Index the meeting for RAG search. Don't fail the request if embedding hiccups.
  try {
    await indexMeeting(supabase, { id: meeting.id, user_id: user.id, title, raw_notes, ai_summary })
  } catch (e) {
    console.error('RAG index failed:', e)
  }

  return NextResponse.json(meeting, { status: 201 })
}