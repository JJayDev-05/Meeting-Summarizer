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

// GET /api/meetings/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('meetings')
    .select(`*, action_items (*)`)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json(data)
}

// PATCH /api/meetings/[id] — rename or re-summarize
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Build the meetings update from whichever fields are present
  const meetingUpdate: Record<string, unknown> = {}
  if (body.title !== undefined) meetingUpdate.title = body.title
  if (body.meeting_date !== undefined) meetingUpdate.meeting_date = body.meeting_date
  if (body.raw_notes !== undefined) meetingUpdate.raw_notes = body.raw_notes
  if (body.ai_summary !== undefined) meetingUpdate.ai_summary = body.ai_summary
  if (body.ai_decisions !== undefined) meetingUpdate.ai_decisions = body.ai_decisions

  if (Object.keys(meetingUpdate).length > 0) {
    const { error } = await supabase.from('meetings').update(meetingUpdate).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Replace action items if provided
  if (Array.isArray(body.action_items)) {
    await supabase.from('action_items').delete().eq('meeting_id', id)
    if (body.action_items.length > 0) {
      const { error } = await supabase.from('action_items').insert(
        body.action_items.map((item: { task: string; owner: string }) => ({
          meeting_id: id,
          task: item.task,
          owner: item.owner || null,
          is_done: false,
        }))
      )
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // Re-index for RAG search if any embeddable field changed.
  if (['title', 'raw_notes', 'ai_summary'].some((k) => k in meetingUpdate)) {
    try {
      const { data: m } = await supabase
        .from('meetings')
        .select('id, user_id, title, raw_notes, ai_summary')
        .eq('id', id)
        .single()
      if (m) await indexMeeting(supabase, m)
    } catch (e) {
      console.error('RAG re-index failed:', e)
    }
  }

  return NextResponse.json({ success: true })
}


// DELETE /api/meetings/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()

  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}