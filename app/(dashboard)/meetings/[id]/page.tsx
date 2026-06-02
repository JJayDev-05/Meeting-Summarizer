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
  const { meetings } = useMeetings()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [prevMeeting, setPrevMeeting] = useState<Meeting | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const prevId = useRef<string | null>(null)

  useEffect(() => {
    if (!id) return
    const idStr = id as string

    if (prevId.current !== idStr) {
      // New meeting selected — check context cache first for instant render
      const cached = meetings.find(m => m.id === idStr)
      if (cached) {
        prevId.current = idStr
        setMeeting(cached)
        setActionItems(cached.action_items || [])
        setLoading(false)
        setNotFound(false)
        return
      }
      // Not in context yet (direct URL) — fetch individually
      setLoading(true)
      setPrevMeeting(meeting)
      setMeeting(null)
      setNotFound(false)
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

  async function toggleActionItem(itemId: string, isDone: boolean) {
    setActionItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, is_done: !isDone } : item)
    )
    await fetch(`/api/action-items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_done: !isDone }),
    })
  }

  const decisions = meeting?.ai_decisions
    ? meeting.ai_decisions.split(' | ').filter(Boolean)
    : []

  return (
    <>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <main className="db-main">
        {loading && !prevMeeting && <PageLoader text="Loading meeting..." />}
        {loading && prevMeeting && (
          <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
            {/* show previous meeting faded while loading */}
          </div>
        )}
        {notFound && !loading && (
          <div className="db-not-found">
            <div className="db-not-found-title">Meeting not found</div>
            <div className="db-not-found-sub">This meeting may have been deleted.</div>
          </div>
        )}

        {meeting && !loading && (
          <>
            <div className="db-header">
              <div className="db-title-row">
                <div className="db-page-title">{meeting.title}</div>
              </div>
              <div className="db-meta">
                {meeting.meeting_date && (
                  <span>{new Date(meeting.meeting_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                )}
                <span>{actionItems.filter(i => i.is_done).length}/{actionItems.length} tasks done</span>
              </div>
            </div>

           <div style={{ 
  display: 'grid', 
  gridTemplateColumns: '1fr 1fr', 
  gap: '24px',
  height: 'calc(100vh - 200px)'
}}>
  {/* Left column */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>
    {meeting.ai_summary && (
      <div className="db-section" style={{ flex: 1 }}>
        <div className="db-section-label db-label-blue">Summary</div>
        <div className="db-section-scroll">
          <div className="db-summary-text">{meeting.ai_summary}</div>
        </div>
      </div>
    )}
    {decisions.length > 0 && (
      <div className="db-section" style={{ flex: 1 }}>
        <div className="db-section-label db-label-green">Decisions</div>
        <div className="db-section-scroll">
          <div className="db-decisions">
            {decisions.map((d, i) => <span key={i} className="db-decision-chip">✓ {d}</span>)}
          </div>
        </div>
      </div>
    )}
  </div>

  {/* Right column */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}>
    {actionItems.length > 0 && (
      <div className="db-section" style={{ flex: 1 }}>
        <div className="db-section-label db-label-amber" style={{ marginBottom: 6, flexShrink: 0 }}>
          Action items — {actionItems.filter(i => i.is_done).length}/{actionItems.length} done
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', marginBottom: '14px', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ height: '100%', width: `${(actionItems.filter(i => i.is_done).length / actionItems.length) * 100}%`, background: actionItems.every(i => i.is_done) ? '#22d3a5' : '#6c63ff', borderRadius: '99px', transition: 'width 0.4s ease' }} />
        </div>
        <div className="db-action-items db-section-scroll">
          {actionItems.map(item => (
            <div key={item.id} className={`db-action-item ${item.is_done ? 'done' : ''}`} onClick={() => toggleActionItem(item.id, item.is_done)}>
              <div className={`db-checkbox ${item.is_done ? 'checked' : ''}`}>
                {item.is_done && <svg fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5} width={12} height={12}><path d="M5 13l4 4L19 7"/></svg>}
              </div>
              <span className="db-action-task">{item.task}</span>
              {item.owner && <span className="db-action-owner">{item.owner}</span>}
            </div>
          ))}
        </div>
      </div>
    )}
    {meeting.raw_notes && (
      <div className="db-section" style={{ flex: 1 }}>
        <div className="db-section-label db-label-gray">Raw notes</div>
        <div className="db-section-scroll">
          <div className="db-raw-notes">{meeting.raw_notes}</div>
        </div>
      </div>
    )}
  </div>
</div>
          </>
        )}
      </main>
    </>
  )
}