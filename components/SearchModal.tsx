'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Meeting {
  id: string
  title: string
  meeting_date: string | null
  created_at: string
}

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return
    fetch('/api/meetings')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMeetings(data) })
      .catch(() => {})
  }, [open])

  useEffect(() => {
    if (!open) { setQuery(''); return }
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const filtered = meetings.filter(m =>
    m.title.toLowerCase().includes(query.toLowerCase())
  )

  if (!open) return null

  return (
    <>
      <style>{`
        .search-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          z-index: 200; display: flex; align-items: flex-start;
          justify-content: center; padding-top: 120px;
          backdrop-filter: blur(4px);
        }
        .search-modal {
          background: #141830; border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px; width: 100%; max-width: 780px;
          overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }
        .search-input-wrap {
          display: flex; align-items: center; gap: 12px; padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .search-input {
          flex: 1; background: none; border: none; outline: none;
          color: #f0f2ff; font-size: 16px; font-family: 'DM Sans', sans-serif;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.3); }
        .search-results { max-height: 420px; overflow-y: auto; padding: 8px; }
        .search-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 10px;
          text-decoration: none; color: #f0f2ff;
          transition: background 0.15s; cursor: pointer;
        }
        .search-item:hover { background: rgba(255,255,255,0.06); }
        .search-item-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(108,99,255,0.15);
          display: flex; align-items: center; justify-content: center;
          color: #a78bfa; flex-shrink: 0;
        }
        .search-item-title { font-size: 14px; font-weight: 500; }
        .search-item-date { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }
        .search-empty { padding: 32px; text-align: center; color: rgba(255,255,255,0.3); font-size: 14px; }
        .search-hint { padding: 10px 20px; font-size: 12px; color: rgba(255,255,255,0.2); border-top: 1px solid rgba(255,255,255,0.07); }
      `}</style>

      <div className="search-overlay" onClick={onClose}>
        <div className="search-modal" onClick={e => e.stopPropagation()}>
          <div className="search-input-wrap">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={18} height={18} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
              <path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/>
            </svg>
            <input
              className="search-input"
              placeholder="Search meetings..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 4 }}>✕</button>
            )}
          </div>

          <div className="search-results">
            {filtered.length === 0 ? (
              <div className="search-empty">
                {query ? `No meetings found for "${query}"` : 'Start typing to search...'}
              </div>
            ) : (
              filtered.map(meeting => (
                <Link
                  key={meeting.id}
                  href={`/meetings/${meeting.id}`}
                  className="search-item"
                  onClick={onClose}
                >
                  <div className="search-item-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={16} height={16}>
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="search-item-title">{meeting.title}</div>
                    <div className="search-item-date">
                      {meeting.meeting_date
                        ? new Date(meeting.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : new Date(meeting.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="search-hint">Press Esc to close</div>
        </div>
      </div>
    </>
  )
}