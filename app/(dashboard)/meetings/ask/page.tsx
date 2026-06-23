'use client'
import { useState } from 'react'
import Link from 'next/link'
import { askMeetings } from '@/lib/api'

type Source = { id: string; title: string; meeting_date: string | null }

export default function AskPage() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  const [error, setError] = useState('')

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault()
    const q = question.trim()
    if (!q || loading) return

    setLoading(true)
    setError('')
    setAnswer('')
    setSources([])
    try {
      const data = await askMeetings(q)
      setAnswer(data.answer)
      setSources(data.sources)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const examples = [
    'What did we decide about pricing?',
    'What are my open action items?',
    'Summarize what we discussed about the launch.',
  ]

  return (
    <>
      <style>{`
        .ask-wrap { max-width: 760px; margin: 0 auto; padding: 64px 24px 96px; min-height: 100vh; }
        .ask-head { margin-bottom: 28px; }
        .ask-title {
          font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 700;
          color: #f0f2ff; margin: 0 0 8px;
        }
        .ask-sub { font-size: 15px; color: #8892b0; line-height: 1.55; margin: 0; }

        .ask-form { display: flex; gap: 10px; margin-bottom: 16px; }
        .ask-input {
          flex: 1; background: #141830; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; color: #f0f2ff; font-size: 15px; padding: 14px 16px;
          font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.15s;
        }
        .ask-input:focus { border-color: rgba(108,99,255,0.6); }
        .ask-input::placeholder { color: rgba(255,255,255,0.3); }
        .ask-btn {
          background: linear-gradient(135deg, #6c63ff, #a78bfa); color: #fff;
          border: none; border-radius: 12px; padding: 0 24px; font-size: 15px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity 0.15s; white-space: nowrap;
        }
        .ask-btn:hover { opacity: 0.9; }
        .ask-btn:disabled { opacity: 0.5; cursor: default; }

        .ask-examples { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
        .ask-chip {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 99px; color: #8892b0; font-size: 13px; padding: 7px 14px;
          cursor: pointer; transition: background 0.15s, color 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .ask-chip:hover { background: rgba(108,99,255,0.15); color: #f0f2ff; }

        .ask-answer-card {
          background: #141830; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 24px; margin-bottom: 20px;
        }
        .ask-answer-text {
          font-size: 15px; line-height: 1.7; color: #e6e9ff; white-space: pre-wrap; margin: 0;
        }
        .ask-sources-label {
          font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;
          color: #8892b0; margin: 20px 0 10px;
        }
        .ask-sources { display: flex; flex-wrap: wrap; gap: 8px; }
        .ask-source {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(108,99,255,0.12); border: 1px solid rgba(108,99,255,0.25);
          border-radius: 99px; color: #c7c2ff; font-size: 13px; padding: 6px 12px;
          text-decoration: none; transition: background 0.15s;
        }
        .ask-source:hover { background: rgba(108,99,255,0.22); }

        .ask-loading { color: #8892b0; font-size: 14px; padding: 8px 0; }
        .ask-error { color: #ff8a8a; font-size: 14px; }
      `}</style>

      <div className="ask-wrap">
        <div className="ask-head">
          <h1 className="ask-title">Ask your meetings</h1>
          <p className="ask-sub">Ask anything about your past meetings: decisions, action items, or what was discussed. Answers come straight from your own notes.</p>
        </div>

        <form className="ask-form" onSubmit={handleAsk}>
          <input
            className="ask-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What did we decide about the budget?"
            maxLength={500}
          />
          <button className="ask-btn" type="submit" disabled={loading || !question.trim()}>
            {loading ? 'Thinking…' : 'Ask'}
          </button>
        </form>

        {!answer && !loading && (
          <div className="ask-examples">
            {examples.map((ex) => (
              <button key={ex} className="ask-chip" type="button" onClick={() => setQuestion(ex)}>
                {ex}
              </button>
            ))}
          </div>
        )}

        {loading && <div className="ask-loading">Searching your meetings…</div>}
        {error && <div className="ask-error">{error}</div>}

        {answer && (
          <div className="ask-answer-card">
            <p className="ask-answer-text">{answer}</p>
            {sources.length > 0 && (
              <>
                <div className="ask-sources-label">Sources</div>
                <div className="ask-sources">
                  {sources.map((s) => (
                    <Link key={s.id} href={`/meetings/${s.id}`} className="ask-source">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {s.title}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
