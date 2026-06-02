'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageLoader from '@/components/PageLoader'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { useMeetings } from '@/lib/meetings-context'

interface ActionItem {
  id: string
  task: string
  owner: string | null
  due_date: string | null
  is_done: boolean
}

interface Meeting {
  id: string
  title: string
  meeting_date: string | null
  raw_notes: string | null
  ai_summary: string | null
  ai_decisions: string | null
  created_at: string
  action_items: ActionItem[]
}

export default function MeetingDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const { toast, showToast, hideToast } = useToast()
  const { meetings, updateMeeting } = useMeetings()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [resummarizing, setResummarizing] = useState(false)
  const [prevMeeting, setPrevMeeting] = useState<Meeting | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const prevId = useRef<string | null>(null)

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    const idStr = id as string

    if (prevId.current !== idStr) {
      const cached = meetings.find(m => m.id === idStr)
      if (cached) {
        prevId.current = idStr
        setMeeting(cached)
        setActionItems(cached.action_items || [])
        setLoading(false)
        setNotFound(false)
        setEditing(false)
        return
      }
      setLoading(true)
      setPrevMeeting(meeting)
      setMeeting(null)
      setNotFound(false)
      setEditing(false)
      prevId.current = idStr

      fetch(`/api/meetings/${idStr}`)
        .then(res => {
          if (!res.ok) { setNotFound(true); return null }
          return res.json()
        })
        .then(data => {
          if (data) {
            setMeeting(data)
            setActionItems(data.action_items || [])
          }
        })
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false))
    }
  }, [id, meetings])

  function startEditing() {
    if (!meeting) return
    setEditTitle(meeting.title)
    setEditDate(meeting.meeting_date ?? '')
    setEditNotes(meeting.raw_notes ?? '')
    setEditing(true)
  }

  async function handleEditSave() {
    if (!meeting || !editTitle.trim()) { showToast('Title cannot be empty.', 'error'); return }
    setSaving(true)
    try {
      await fetch(`/api/meetings/${meeting.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim(), meeting_date: editDate || null, raw_notes: editNotes }),
      })
      const updated = { ...meeting, title: editTitle.trim(), meeting_date: editDate || null, raw_notes: editNotes }
      setMeeting(updated)
      updateMeeting(meeting.id, updated)
      setEditing(false)
      showToast('Meeting updated!', 'success')
    } catch {
      showToast('Failed to save changes.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleResummarize() {
    if (!meeting?.raw_notes) return
    setResummarizing(true)
    try {
      const aiRes = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: meeting.raw_notes }),
      })
      const aiData = await aiRes.json()
      if (!aiRes.ok) throw new Error(aiData.error || 'AI failed')

      const newSummary = aiData.summary || ''
      const newDecisions = (aiData.decisions || []).join(' | ')
      const newActionItems = aiData.action_items || []

      await fetch(`/api/meetings/${meeting.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai_summary: newSummary, ai_decisions: newDecisions, action_items: newActionItems }),
      })

      const updatedActionItems = newActionItems.map((item: { task: string; owner: string }, i: number) => ({
        id: `temp-${i}`,
        task: item.task,
        owner: item.owner || null,
        due_date: null,
        is_done: false,
      }))

      const updated = { ...meeting, ai_summary: newSummary, ai_decisions: newDecisions, action_items: updatedActionItems }
      setMeeting(updated)
      setActionItems(updatedActionItems)
      updateMeeting(meeting.id, updated)
      showToast('Meeting re-summarized!', 'success')
    } catch {
      showToast('AI summarization failed. Please try again.', 'error')
    } finally {
      setResummarizing(false)
    }
  }

  async function toggleActionItem(itemId: string, isDone: boolean) {
    const updated = actionItems.map(item => item.id === itemId ? { ...item, is_done: !isDone } : item)
    setActionItems(updated)
    if (meeting) updateMeeting(meeting.id, { action_items: updated })
    await fetch(`/api/action-items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_done: !isDone }),
    })
  }

  const decisions = meeting?.ai_decisions
    ? meeting.ai_decisions.split(' | ').filter(Boolean)
    : []

  const btnBase: React.CSSProperties = { flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', border: 'none', transition: 'background 0.2s' }

  return (
    <>
      <style>{`
        .detail-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .detail-grid { grid-template-columns: 1fr; }
        }
        .edit-input {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(108,99,255,0.4);
          border-radius: 8px; color: #f0f2ff; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s;
        }
        .edit-input:focus { border-color: rgba(108,99,255,0.7); }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <main className="db-main" style={{ paddingBottom: 48 }}>
        {loading && !prevMeeting && <PageLoader text="Loading meeting..." />}
        {notFound && !loading && (
          <div className="db-not-found">
            <div className="db-not-found-title">Meeting not found</div>
            <div className="db-not-found-sub">This meeting may have been deleted.</div>
          </div>
        )}

        {meeting && !loading && (
          <>
            <div className="db-header">
              <div className="db-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                {editing ? (
                  <input
                    className="edit-input"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Syne, sans-serif', padding: '6px 12px', flex: 1, minWidth: 0 }}
                    autoFocus
                  />
                ) : (
                  <div className="db-page-title">{meeting.title}</div>
                )}

                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {editing ? (
                    <>
                      <button onClick={() => setEditing(false)} style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>Cancel</button>
                      <button onClick={handleEditSave} disabled={saving} style={{ ...btnBase, background: '#6c63ff', color: '#fff', opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}>
                        {saving ? 'Saving...' : 'Save changes'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={startEditing} style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
                        ✏️ Edit
                      </button>
                      {meeting.raw_notes && (
                        <button onClick={handleResummarize} disabled={resummarizing} style={{ ...btnBase, background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', color: '#a78bfa', opacity: resummarizing ? 0.6 : 1, cursor: resummarizing ? 'not-allowed' : 'pointer' }}>
                          {resummarizing ? <><div className="db-spinner" style={{ width: 12, height: 12 }} /> Re-summarizing...</> : <>✦ Re-summarize</>}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="db-meta" style={{ marginTop: editing ? 10 : undefined }}>
                {editing ? (
                  <input
                    className="edit-input"
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    style={{ fontSize: 13, padding: '4px 10px' }}
                  />
                ) : (
                  meeting.meeting_date && (
                    <span>{new Date(meeting.meeting_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  )
                )}
                {!editing && <span>{actionItems.filter(i => i.is_done).length}/{actionItems.length} tasks done</span>}
              </div>
            </div>

            <div className="detail-grid">
              {/* Left — Summary + Decisions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {meeting.ai_summary && (
                  <div className="db-section">
                    <div className="db-section-label db-label-blue">Summary</div>
                    <div className="db-summary-text">{meeting.ai_summary}</div>
                  </div>
                )}
                {decisions.length > 0 && (
                  <div className="db-section">
                    <div className="db-section-label db-label-green">Decisions</div>
                    <div className="db-decisions">
                      {decisions.map((d, i) => <span key={i} className="db-decision-chip">✓ {d}</span>)}
                    </div>
                  </div>
                )}
              </div>

              {/* Right — Action Items */}
              {actionItems.length > 0 && (
                <div className="db-section">
                  <div className="db-section-label db-label-amber" style={{ marginBottom: 6 }}>
                    Action items — {actionItems.filter(i => i.is_done).length}/{actionItems.length} done
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', marginBottom: '14px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(actionItems.filter(i => i.is_done).length / actionItems.length) * 100}%`, background: actionItems.every(i => i.is_done) ? '#22d3a5' : '#6c63ff', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                  </div>
                  <div className="db-action-items">
                    {actionItems.map(item => (
                      <div key={item.id} className={`db-action-item ${item.is_done ? 'done' : ''}`} onClick={() => toggleActionItem(item.id, item.is_done)}>
                        <div className={`db-checkbox ${item.is_done ? 'checked' : ''}`}>
                          {item.is_done && <svg fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5} width={12} height={12}><path d="M5 13l4 4L19 7"/></svg>}
                        </div>
                        <span className="db-action-task">{item.task}</span>
                        {item.owner && <span className="db-action-owner">{item.owner}</span>}
                        {item.due_date && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto', flexShrink: 0 }}>{new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Raw notes — full width below the grid */}
            <div className="db-section" style={{ marginTop: 24 }}>
              <div className="db-section-label db-label-gray">Raw notes</div>
              {editing ? (
                <textarea
                  className="edit-input"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  style={{ width: '100%', minHeight: 200, padding: 14, fontSize: 14, lineHeight: 1.7, resize: 'vertical' }}
                />
              ) : (
                meeting.raw_notes ? (
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    <div className="db-raw-notes">{meeting.raw_notes}</div>
                  </div>
                ) : (
                  <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No raw notes.</div>
                )
              )}
            </div>
          </>
        )}
      </main>
    </>
  )
}
