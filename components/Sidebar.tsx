'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import SearchModal from '@/components/SearchModal'
import { useMeetings } from '@/lib/meetings-context'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  sidebarW: number
  isMobile?: boolean
  mobileOpen?: boolean
  onMobileClose?: () => void
}


export default function Sidebar({ collapsed, onToggle, sidebarW, isMobile = false, mobileOpen = false, onMobileClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { meetings, initialized, updateMeeting, removeMeeting } = useMeetings()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [clickedId, setClickedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  const iconSize = collapsed ? 24 : 18

  useEffect(() => {
    function handleClickOutside() { setMenuOpen(null) }
    if (menuOpen) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [menuOpen])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { id } = deleteTarget
    setDeleteTarget(null)
    await fetch(`/api/meetings/${id}`, { method: 'DELETE' })
    removeMeeting(id)
    if (pathname === `/meetings/${id}`) router.push('/meetings/new')
  }

  async function handleRename(meetingId: string) {
    if (!renameValue.trim()) return
    setMenuOpen(null)
    setRenaming(null)
    await fetch(`/api/meetings/${meetingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: renameValue }),
    })
    updateMeeting(meetingId, { title: renameValue })
    setRenameValue('')
  }

  return (
    <>
      <style>{`
        .db-sidebar {
          background: #0d1128;
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          padding: 16px 10px;
          flex-shrink: 0;
          position: fixed; top: 0; left: 0; bottom: 0;
          transition: width 0.25s ease;
          overflow: hidden;
          z-index: 50;
          cursor: default;
        }
        .db-sidebar.collapsed {
          cursor: pointer;
        }

        .db-sidebar-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; min-width: 0; gap: 8px;
          flex-shrink: 0;
        }
        .db-logo { display: flex; align-items: center; gap: 10px; min-width: 0; overflow: hidden; flex: 1; }
        .db-logo-icon {
          width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, #6c63ff, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; color: #fff;
        }
        .db-logo-text {
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700;
          color: #f0f2ff; white-space: nowrap; transition: opacity 0.2s;
        }
        .db-toggle-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.35); width: 28px; height: 28px;
          border-radius: 6px; display: flex; align-items: center; justify-content: center;
          transition: color 0.15s, background 0.15s; flex-shrink: 0;
        }
        .db-toggle-btn:hover { color: #f0f2ff; background: rgba(255,255,255,0.06); }

        /* Nav buttons */
        .db-nav-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 8px; border-radius: 10px;
          color: rgba(255,255,255,0.85); font-size: 15px;
          transition: background 0.15s, color 0.15s; margin-bottom: 4px;
          white-space: nowrap; overflow: hidden; min-width: 0;
          text-decoration: none; border: none; background: none;
          cursor: pointer; width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif;
          flex-shrink: 0;
        }
        .db-nav-btn:hover { background: rgba(255,255,255,0.06); color: #f0f2ff; }
        .db-nav-btn.active { background: rgba(108,99,255,0.2); color: #f0f2ff; font-weight: 500; }
        .db-nav-btn svg { flex-shrink: 0; }
        .db-nav-label { overflow: hidden; transition: opacity 0.15s; font-size: 14px; }

        /* Divider */
        .db-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 8px 0; flex-shrink: 0; }

        /* Recents section */
        .db-recents-label {
          font-size: 11px; font-weight: 600; letter-spacing: 1px;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
          padding: 4px 8px 8px; white-space: nowrap;
          transition: opacity 0.15s; flex-shrink: 0;
        }

        .db-recents-list {
          flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 2px;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .db-recents-list::-webkit-scrollbar { width: 4px; }
        .db-recents-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        @keyframes meeting-tap {
          0%   { background: rgba(108,99,255,0.08); }
          35%  { background: rgba(108,99,255,0.28); }
          100% { background: rgba(108,99,255,0.15); }
        }
        .db-recent-row {
          position: relative; display: flex; align-items: center;
          border-radius: 8px; flex-shrink: 0;
        }
        .db-recent-row.tapping { animation: meeting-tap 0.4s ease forwards; }
        .db-recent-row:hover .db-recent-menu-btn { opacity: 1; }
        .db-recent-item {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 8px 8px; border-radius: 8px;
          color: rgba(255,255,255,0.85); font-size: 15px;
          text-decoration: none; transition: background 0.15s, color 0.15s;
          overflow: hidden; min-width: 0;
          flex: 1;
        }
        .db-recent-item:hover { background: rgba(255,255,255,0.06); color: #f0f2ff; }
        .db-recent-item.active { color: #f0f2ff; }
        .db-recent-row:has(.db-recent-item.active) { background: rgba(108,99,255,0.15); }
        .db-sidebar.collapsed .db-recent-row:has(.db-recent-item.active) { background: transparent; }
        .db-recent-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(108,99,255,0.6); flex-shrink: 0; margin-top: 5px; }
        .db-recent-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
        .db-recent-title-row { display: flex; align-items: center; gap: 6px; min-width: 0; }
        .db-recent-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
        .db-complete-badge {
          font-size: 10px; font-weight: 600; letter-spacing: 0.3px;
          color: #22d3a5; background: rgba(34,211,165,0.12);
          border-radius: 99px; padding: 1px 6px; flex-shrink: 0; white-space: nowrap;
        }
        .db-meeting-progress {
          height: 3px; background: rgba(255,255,255,0.08);
          border-radius: 99px; overflow: hidden;
        }
        .db-meeting-progress-fill {
          height: 100%; border-radius: 99px;
          transition: width 0.4s ease, background 0.4s ease;
        }
        .db-recent-menu-btn {
          opacity: 0; flex-shrink: 0;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4); padding: 4px 6px;
          border-radius: 6px; transition: opacity 0.15s, background 0.15s;
          font-size: 14px; line-height: 1;
        }
        .db-recent-menu-btn:hover { background: rgba(255,255,255,0.08); color: #f0f2ff; }
        .db-recent-dropdown {
          position: absolute; right: 0; top: 100%;
          background: #1a1f3a; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 4px;
          z-index: 100; min-width: 130px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .db-recent-dropdown-item {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 10px; border-radius: 6px;
          font-size: 13px; cursor: pointer;
          transition: background 0.15s; border: none;
          background: none; width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,0.7);
        }
        .db-recent-dropdown-item:hover { background: rgba(255,255,255,0.06); color: #f0f2ff; }
        .db-recent-dropdown-item.danger { color: #ff6b6b; }
        .db-recent-dropdown-item.danger:hover { background: rgba(255,80,80,0.1); }
        .db-rename-input {
          flex: 1; background: rgba(255,255,255,0.06);
          border: 1px solid rgba(108,99,255,0.4);
          border-radius: 6px; color: #f0f2ff;
          font-size: 13px; padding: 4px 8px;
          font-family: 'DM Sans', sans-serif; outline: none;
        }

        .db-no-recents {
          padding: 12px 8px; font-size: 12px;
          color: rgba(255,255,255,0.2); text-align: center;
        }

        /* Sign out */
        .db-signout {
          flex-shrink: 0;
          display: flex; align-items: center; gap: 10px;
          padding: 12px 8px 10px 8px;
          color: rgba(255,255,255,0.4); font-size: 14px;
          cursor: pointer; transition: color 0.15s;
          border: none; border-top: 1px solid rgba(255,255,255,0.07);
          background: none; width: 100%; text-align: left;
          white-space: nowrap; overflow: hidden; min-width: 0;
          font-family: 'DM Sans', sans-serif;
          margin-top: 8px;
        }
        .db-signout:hover { color: #f0f2ff; background: rgba(255,255,255,0.04); }

        .db-confirm-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px); z-index: 500;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .db-confirm-modal {
          background: #141830; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 28px 28px 24px;
          width: 100%; max-width: 360px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }
        .db-confirm-icon {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,80,80,0.12);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
        }
        .db-confirm-title {
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700;
          color: #f0f2ff; margin-bottom: 8px;
        }
        .db-confirm-msg {
          font-size: 14px; color: #8892b0; line-height: 1.55; margin-bottom: 22px;
        }
        .db-confirm-msg strong { color: #f0f2ff; }
        .db-confirm-actions { display: flex; gap: 10px; }
        .db-confirm-cancel {
          flex: 1; padding: 11px; background: rgba(255,255,255,0.06);
          color: #f0f2ff; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.2s;
        }
        .db-confirm-cancel:hover { background: rgba(255,255,255,0.1); }
        .db-confirm-delete {
          flex: 1; padding: 11px; background: #ef4444;
          color: #fff; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.2s;
        }
        .db-confirm-delete:hover { background: #dc2626; }
      `}</style>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {deleteTarget && (
        <div className="db-confirm-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="db-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="db-confirm-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={2} width={20} height={20}>
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
              </svg>
            </div>
            <div className="db-confirm-title">Delete meeting?</div>
            <div className="db-confirm-msg">
              <strong>{deleteTarget.title}</strong> will be permanently deleted. This cannot be undone.
            </div>
            <div className="db-confirm-actions">
              <button className="db-confirm-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="db-confirm-delete" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <aside
        className={`db-sidebar ${collapsed ? 'collapsed' : ''}`}
        style={{
          width: sidebarW,
          transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: isMobile ? 'transform 0.25s ease' : 'width 0.25s ease',
          zIndex: isMobile ? 60 : 50,
        }}
        onClick={collapsed ? onToggle : undefined}
      >

        {/* Top row */}
        <div className="db-sidebar-top">
          <div className="db-logo">
  <img
    src="/logo.png"
    alt="Meeting Summarizer"
    style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'contain', flexShrink: 0 }}
  />
  <span className="db-logo-text" style={{ opacity: collapsed ? 0 : 1 }}>
    Meeting Summarizer
  </span>
</div>
          {!collapsed && (
            <button className="db-toggle-btn" onClick={onToggle} title="Collapse sidebar">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={18} height={18}>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 3v18"/>
              </svg>
            </button>
          )}
        </div>

        {/* New meeting */}
        <Link href="/meetings/new" className={`db-nav-btn ${pathname === '/meetings/new' ? 'active' : ''}`} title="New meeting">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={iconSize} height={iconSize}>
            <path d="M12 4v16m8-8H4"/>
          </svg>
          <span className="db-nav-label" style={{ opacity: collapsed ? 0 : 1 }}>New meeting</span>
        </Link>

        {/* Search */}
        <button className="db-nav-btn" onClick={() => setSearchOpen(true)} title="Search">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={iconSize} height={iconSize}>
            <path d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/>
          </svg>
          <span className="db-nav-label" style={{ opacity: collapsed ? 0 : 1 }}>Search</span>
        </button>

        {/* Ask AI */}
        <Link href="/meetings/ask" className={`db-nav-btn ${pathname === '/meetings/ask' ? 'active' : ''}`} title="Ask your meetings">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={iconSize} height={iconSize}>
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="db-nav-label" style={{ opacity: collapsed ? 0 : 1 }}>Ask AI</span>
        </Link>

        <div className="db-divider" />

        {/* Recents label */}
        <div className="db-recents-label" style={{ opacity: collapsed ? 0 : 1 }}>
          Recents
        </div>

        {/* Recents list */}
<div className="db-recents-list">
  {!initialized ? null : meetings.length === 0 ? (
    <div className="db-no-recents" style={{ opacity: collapsed ? 0 : 1 }}>
      No meetings yet
    </div>
  ) : (
    meetings.map(meeting => (
      <div
        key={meeting.id}
        className={`db-recent-row ${clickedId === meeting.id ? 'tapping' : ''}`}
        onAnimationEnd={() => setClickedId(null)}
      >
        {renaming === meeting.id ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', flex: 1 }}>
            <input
              className="db-rename-input"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRename(meeting.id)
                if (e.key === 'Escape') { setRenaming(null); setMenuOpen(null) }
              }}
              autoFocus
            />
            <button onClick={() => handleRename(meeting.id)} style={{ background: '#6c63ff', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, padding: '4px 8px', cursor: 'pointer' }}>✓</button>
          </div>
        ) : (
          <>
            <Link
              href={`/meetings/${meeting.id}`}
              className={`db-recent-item ${pathname === `/meetings/${meeting.id}` ? 'active' : ''}`}
              title={meeting.title}
              onClick={() => { setMenuOpen(null); setClickedId(meeting.id); onMobileClose?.() }}
            >
              <span className="db-recent-dot" style={{ opacity: collapsed ? 0 : 1 }} />
              {(() => {
                const total = meeting.action_items?.length ?? 0
                const done = meeting.action_items?.filter(i => i.is_done).length ?? 0
                const allDone = total > 0 && done === total
                return (
                  <div className="db-recent-text" style={{ opacity: collapsed ? 0 : 1 }}>
                    <div className="db-recent-title-row">
                      <span className="db-recent-title">{meeting.title}</span>
                      {allDone && <span className="db-complete-badge">✓ Done</span>}
                    </div>
                    {total > 0 && !allDone && (
                      <div className="db-meeting-progress">
                        <div
                          className="db-meeting-progress-fill"
                          style={{ width: `${(done / total) * 100}%`, background: '#6c63ff' }}
                        />
                      </div>
                    )}
                  </div>
                )
              })()}
            </Link>
            {!collapsed && (
              <button
                className="db-recent-menu-btn"
                onClick={e => { e.preventDefault(); e.stopPropagation(); setMenuOpen(menuOpen === meeting.id ? null : meeting.id) }}
              >
                ···
              </button>
            )}
            {menuOpen === meeting.id && (
              <div className="db-recent-dropdown">
                <button className="db-recent-dropdown-item" onClick={() => { setRenaming(meeting.id); setRenameValue(meeting.title); setMenuOpen(null) }}>
                  ✏️ Rename
                </button>
                <button className="db-recent-dropdown-item danger" onClick={() => { setMenuOpen(null); setDeleteTarget({ id: meeting.id, title: meeting.title }) }}>
                  🗑️ Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    ))
  )}
</div>

        {/* Sign out */}
        <button className="db-signout" onClick={handleSignOut} title="Sign out">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={iconSize} height={iconSize} style={{ flexShrink: 0 }}>
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span style={{ opacity: collapsed ? 0 : 1, overflow: 'hidden' }}>Sign out</span>
        </button>

      </aside>
    </>
  )
}