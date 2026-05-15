'use client'
import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

export default function NewMeetingPage() {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarW = collapsed ? 64 : 300

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [decisions, setDecisions] = useState<string[]>([])
  const [actionItems, setActionItems] = useState<{ task: string; owner: string }[]>([])
  const [aiDone, setAiDone] = useState(false)

  async function handleSummarize() {
    if (!notes.trim()) {
      alert('Please paste your meeting notes first.')
      return
    }

    setLoading(true)
    setAiDone(false)

    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      const data = await res.json()

      setSummary(data.summary || '')
      setDecisions(data.decisions || [])
      setActionItems(data.action_items || [])
      setAiDone(true)
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      alert('Please add a meeting title.')
      return
    }

    alert('Save to Supabase coming in Week 2!')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: #090d1e;
        }

        .db-wrap {
          display: flex;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #090d1e;
          color: #f0f2ff;
        }

        .db-main {
          flex: 1;
          padding: 40px 48px;
          transition: margin-left 0.25s ease;
          max-width: calc(900px + 240px);
        }

        .db-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          margin-bottom: 24px;
          transition: color 0.2s;
        }

        .db-back:hover {
          color: #f0f2ff;
        }

        .db-back svg {
          width: 16px;
          height: 16px;
        }

        .db-page-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #f0f2ff;
          margin-bottom: 4px;
        }

        .db-page-sub {
          font-size: 14px;
          font-weight: 300;
          color: rgba(255,255,255,0.4);
          margin-bottom: 32px;
        }

        .db-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 860px;
        }

        .db-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .db-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .db-label {
          font-size: 13px;
          font-weight: 500;
          color: #c8cde8;
        }

        .db-input {
          padding: 11px 14px;
          background: #141830;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #f0f2ff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }

        .db-input:focus {
          border-color: rgba(108,99,255,0.5);
        }

        .db-input::placeholder {
          color: rgba(255,255,255,0.2);
        }

        .db-textarea {
          padding: 14px;
          background: #141830;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #f0f2ff;
          font-size: 14px;
          line-height: 1.7;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          resize: vertical;
          min-height: 200px;
        }

        .db-textarea:focus {
          border-color: rgba(108,99,255,0.5);
        }

        .db-textarea::placeholder {
          color: rgba(255,255,255,0.2);
        }

        .db-btn-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .db-btn-ai {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: #6c63ff;
          color: #fff;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s, transform 0.2s;
        }

        .db-btn-ai:hover:not(:disabled) {
          background: #5a52e8;
          transform: translateY(-1px);
        }

        .db-btn-ai:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .db-btn-save {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: #f0f2ff;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.2s;
        }

        .db-btn-save:hover {
          background: rgba(255,255,255,0.1);
        }

        .db-ai-output {
          background: #141830;
          border: 1px solid rgba(108,99,255,0.25);
          border-radius: 14px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .db-ai-section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .db-label-blue {
          color: #6c63ff;
        }

        .db-label-green {
          color: #22d3a5;
        }

        .db-label-amber {
          color: #f5a623;
        }

        .db-summary-text {
          font-size: 14px;
          font-weight: 300;
          color: rgba(255,255,255,0.7);
          line-height: 1.75;
        }

        .db-decisions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .db-decision-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          background: rgba(34,211,165,0.08);
          border: 1px solid rgba(34,211,165,0.2);
          border-radius: 20px;
          font-size: 13px;
          color: #22d3a5;
        }

        .db-action-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .db-action-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 8px;
        }

        .db-action-check {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid rgba(108,99,255,0.4);
          flex-shrink: 0;
        }

        .db-action-task {
          flex: 1;
          font-size: 14px;
          color: rgba(255,255,255,0.8);
        }

        .db-action-owner {
          font-size: 12px;
          color: #a78bfa;
          background: rgba(108,99,255,0.1);
          padding: 2px 10px;
          border-radius: 20px;
        }

        .db-spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(108,99,255,0.2);
          border-top-color: #6c63ff;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="db-wrap">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          activeRoute="/meetings/new"
          sidebarW={sidebarW}
        />

        <main className="db-main" style={{ marginLeft: sidebarW }}>
          <Link href="/meetings" className="db-back">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M15 19l-7-7 7-7" />
            </svg>
            Back to meetings
          </Link>

          <div className="db-page-title">New meeting</div>
          <div className="db-page-sub">
            Paste your notes and let AI do the heavy lifting.
          </div>

          <div className="db-form">
            <div className="db-row">
              <div className="db-field">
                <label className="db-label">Meeting title</label>

                <input
                  className="db-input"
                  type="text"
                  placeholder="e.g. Q3 Planning Session"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="db-field">
                <label className="db-label">Date</label>

                <input
                  className="db-input"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="db-field">
              <label className="db-label">Raw meeting notes</label>

              <textarea
                className="db-textarea"
                placeholder={
                  "Paste your messy notes here...\n\ne.g.\nok so we talked abt Q3 budget\njohn said marketing gets 40k\nsarah will handle the rebrand\nneed to ship v2 by aug 15"
                }
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div className="db-btn-row">
              <button
                className="db-btn-ai"
                onClick={handleSummarize}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="db-spinner" />
                    Summarizing...
                  </>
                ) : (
                  <>✦ Summarize with AI</>
                )}
              </button>

              {aiDone && (
                <button className="db-btn-save" onClick={handleSave}>
                  Save meeting
                </button>
              )}
            </div>

            {aiDone && !loading && (
              <div className="db-ai-output">
                <div>
                  <div className="db-ai-section-label db-label-blue">
                    Summary
                  </div>

                  <div className="db-summary-text">{summary}</div>
                </div>

                {decisions.length > 0 && (
                  <div>
                    <div className="db-ai-section-label db-label-green">
                      Decisions
                    </div>

                    <div className="db-decisions">
                      {decisions.map((d, i) => (
                        <span key={i} className="db-decision-chip">
                          ✓ {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {actionItems.length > 0 && (
                  <div>
                    <div className="db-ai-section-label db-label-amber">
                      Action items
                    </div>

                    <div className="db-action-items">
                      {actionItems.map((item, i) => (
                        <div key={i} className="db-action-item">
                          <div className="db-action-check" />

                          <span className="db-action-task">
                            {item.task}
                          </span>

                          {item.owner && (
                            <span className="db-action-owner">
                              {item.owner}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}