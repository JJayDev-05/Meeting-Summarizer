import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { embed } from '@/lib/embeddings'

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

type Match = { id: string; meeting_id: string; content: string; similarity: number }

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { question } = await request.json()
  if (!question || !question.trim()) {
    return NextResponse.json({ error: 'Question is required' }, { status: 400 })
  }

  try {
    // 1. Embed the question and find the most relevant chunks (RLS limits to this user).
    const queryEmbedding = await embed(question)
    const { data: matches, error } = await supabase.rpc('match_meeting_chunks', {
      query_embedding: queryEmbedding,
      match_count: 6,
    })

    if (error) {
      console.error('match_meeting_chunks error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results = (matches ?? []) as Match[]
    if (results.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find anything about that in your meetings yet. Try adding more notes, or run the backfill if these are older meetings.",
        sources: [],
      })
    }

    // 2. Look up the source meetings (for context labels + clickable sources).
    const meetingIds = [...new Set(results.map((m) => m.meeting_id))]
    const { data: meetingsData } = await supabase
      .from('meetings')
      .select('id, title, meeting_date')
      .in('id', meetingIds)

    const byId = new Map((meetingsData ?? []).map((m) => [m.id, m]))

    const context = results
      .map((m) => `[Meeting: ${byId.get(m.meeting_id)?.title ?? 'Untitled'}]\n${m.content}`)
      .join('\n\n---\n\n')

    // 3. Ask Groq to answer using ONLY the retrieved context.
    const prompt = `You answer questions using the user's own past meeting notes.
Use ONLY the context below. If the answer isn't there, say you couldn't find it in their meetings.
Be concise and conversational, and mention which meeting(s) the information came from.

Context:
${context}

Question: ${question}`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('Groq error:', data)
      return NextResponse.json({ error: data.error?.message || 'Groq API error' }, { status: 500 })
    }

    const answer = data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate an answer."
    const sources = meetingIds.map((id) => ({
      id,
      title: byId.get(id)?.title ?? 'Untitled',
      meeting_date: byId.get(id)?.meeting_date ?? null,
    }))

    return NextResponse.json({ answer, sources })
  } catch (err) {
    console.error('Ask error:', err)
    return NextResponse.json({ error: 'Failed to answer question' }, { status: 500 })
  }
}
