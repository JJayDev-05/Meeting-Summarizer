import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { notes } = await request.json()

  if (!notes || !notes.trim()) {
    return NextResponse.json({ error: 'Notes are required' }, { status: 400 })
  }

  const prompt = `You are a meeting assistant. Analyze these meeting notes and extract structured information.

Return ONLY a valid JSON object with this exact structure, no markdown, no extra text, no backticks:
{
  "summary": "2-4 sentence summary of the meeting",
  "decisions": ["decision 1", "decision 2"],
  "action_items": [
    { "task": "what needs to be done", "owner": "person name or empty string" }
  ]
}

Meeting notes:
${notes}`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

    const data = await response.json()

    if (!response.ok) {
      console.error('Groq error:', data)
      return NextResponse.json({ error: data.error?.message || 'Groq API error' }, { status: 500 })
    }

    const text = data.choices?.[0]?.message?.content?.trim()

    if (!text) {
      return NextResponse.json({ error: 'No response from Groq' }, { status: 500 })
    }

    // Remove markdown code blocks if model adds them
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Summarize error:', error)
    return NextResponse.json({ error: 'Failed to summarize notes' }, { status: 500 })
  }
}
