'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'


export default function NewMeetingPage() {
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [decisions, setDecisions] = useState<string[]>([])
  const [actionItems, setActionItems] = useState<{ task: string; owner: string }[]>([])
  const [aiDone, setAiDone] = useState(false)

  async function handleSummarize() {
    if (!notes.trim()) { showToast('Please paste your meeting notes first.', 'error'); return }
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
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

   async function handleSave() {
    if (!title.trim()) { showToast('Please add a meeting title.', 'error'); return }
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          meeting_date: date || null,
          raw_notes: notes,
          ai_summary: summary,
          ai_decisions: decisions.join(' | '),
          action_items: actionItems,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      const savedMeeting = await res.json()
      showToast('Meeting saved!', 'success')
      window.dispatchEvent(new Event('meeting-saved'))
      setTimeout(() => {
        router.push(`/meetings/${savedMeeting.id}`)
      }, 300)
    } catch {
      showToast('Something went wrong saving the meeting.', 'error')
    }
  }

  return (
    <>
       <style>{`
        .db-title-row { margin-bottom: 24px; }
        .db-form-body { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; flex: 1; min-height: 0; }
        .db-col-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .db-col-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 600; color: #f0f2ff; }
        .db-col-sub { font-size: 12px; font-weight: 300; color: rgba(255,255,255,0.3); }
        .db-form-left { display: flex; flex-direction: column; gap: 14px; min-height: 0; }
        .db-form-right { display: flex; flex-direction: column; gap: 14px; min-height: 0; }
        .db-date-row { display: flex; flex-direction: column; gap: 7px; }
        .db-textarea { padding: 14px; background: #141830; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #f0f2ff; font-size: 15px; line-height: 1.7; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; resize: none; flex: 1; overflow-y: auto; min-height: 0; }
        .db-textarea:focus { border-color: rgba(108,99,255,0.5); }
        .db-textarea::placeholder { color: rgba(255,255,255,0.2); }
        .db-right-empty { background: #141830; border: 1px dashed rgba(255,255,255,0.08); border-radius: 14px; padding: 40px 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 10px; flex: 1; }
        .db-right-empty-icon { font-size: 28px; opacity: 0.2; }
        .db-right-empty-text { font-size: 13px; color: rgba(255,255,255,0.2); line-height: 1.6; }
        .db-right-loading { background: #141830; border: 1px solid rgba(108,99,255,0.15); border-radius: 14px; padding: 40px 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 14px; flex: 1; }
        .db-right-loading-text { font-size: 14px; color: rgba(255,255,255,0.4); }
        .db-ai-output { background: #141830; border: 1px solid rgba(108,99,255,0.25); border-radius: 14px; padding: 24px; display: flex; flex-direction: column; gap: 20px; animation: fadeIn 0.4s ease; flex: 1; overflow-y: auto; }
        .db-ai-section-label { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
        .db-action-check { width: 16px; height: 16px; border-radius: 4px; border: 1px solid rgba(108,99,255,0.4); flex-shrink: 0; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <main className="db-main" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="db-page-title">New meeting</div>
        <div className="db-page-sub">Paste your notes and let AI do the heavy lifting.</div>

        <div className="db-title-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="db-field">
            <label className="db-label">Meeting title</label>
            <input className="db-input" type="text" placeholder="e.g. Q3 Planning Session" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="db-field">
            <label className="db-label">Date</label>
            <input className="db-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>

        <div className="db-form-body">
          <div className="db-form-left">
            <div className="db-col-header">
              <span className="db-col-title">Your meeting notes</span>
              <span className="db-col-sub">Paste raw notes below</span>
            </div>
            <div style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <textarea
                className="db-textarea"
                placeholder={"Paste your messy notes here...\n\ne.g.\nok so we talked abt Q3 budget\njohn said marketing gets 40k\nsarah will handle the rebrand\nneed to ship v2 by aug 15"}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ paddingBottom: '56px' }}
              />
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', gap: '10px' }}>
                <button className="db-btn-ai" onClick={handleSummarize} disabled={loading}>
                  {loading ? <><div className="db-spinner" /> Summarizing...</> : <>✦ Summarize with AI</>}
                </button>
                {aiDone && <button className="db-btn-save" onClick={handleSave}>Save meeting</button>}
              </div>
            </div>
          </div>

          <div className="db-form-right">
            <div className="db-col-header">
              <span className="db-col-title">AI Summary</span>
              <span className="db-col-sub">Generated by Groq</span>
            </div>
            {!aiDone && !loading && (
              <div className="db-right-empty">
                <div className="db-right-empty-icon">✦</div>
                <div className="db-right-empty-text">AI summary will appear here<br />after you click Summarize</div>
              </div>
            )}
            {loading && (
              <div className="db-right-loading">
                <div className="db-spinner" style={{ width: 24, height: 24 }} />
                <div className="db-right-loading-text">AI is reading your notes...</div>
              </div>
            )}
            {aiDone && !loading && (
              <div className="db-ai-output">
                <div>
                  <div className="db-ai-section-label db-label-blue">Summary</div>
                  <div className="db-summary-text">{summary}</div>
                </div>
                {decisions.length > 0 && (
                  <div>
                    <div className="db-ai-section-label db-label-green">Decisions</div>
                    <div className="db-decisions">
                      {decisions.map((d, i) => <span key={i} className="db-decision-chip">✓ {d}</span>)}
                    </div>
                  </div>
                )}
                {actionItems.length > 0 && (
                  <div>
                    <div className="db-ai-section-label db-label-amber">Action items</div>
                    <div className="db-action-items">
                      {actionItems.map((item, i) => (
                        <div key={i} className="db-action-item">
                          <div className="db-action-check" />
                          <span className="db-action-task">{item.task}</span>
                          {item.owner && <span className="db-action-owner">{item.owner}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}