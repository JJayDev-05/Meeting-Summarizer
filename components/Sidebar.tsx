'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  activeRoute: '/dashboard' | '/meetings' | '/meetings/new'
  sidebarW: number
}

export default function Sidebar({ collapsed, onToggle, activeRoute, sidebarW }: SidebarProps) {
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <style>{`
        .db-sidebar {
          background: #0d1128;
          border-right: 1px solid rgba(255,255,255,0.07);
          display: flex; flex-direction: column;
          padding: 20px 12px; flex-shrink: 0;
          position: fixed; top: 0; left: 0; bottom: 0;
          transition: width 0.25s ease; overflow: hidden;
          z-index: 50;
        }
        .db-sidebar-top {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px; padding: 4px; min-width: 0;
        }
        .db-logo { display: flex; align-items: center; gap: 10px; overflow: hidden; min-width: 0; }
        .db-logo-icon {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, #6c63ff, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: #fff;
        }
        .db-logo-text {
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700;
          color: #f0f2ff; white-space: nowrap; transition: opacity 0.2s;
        }
        .db-toggle-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.35); padding: 4px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.15s, background 0.15s; flex-shrink: 0;
        }
        .db-toggle-btn:hover { color: #f0f2ff; background: rgba(255,255,255,0.06); }
        .db-toggle-btn svg { width: 18px; height: 18px; }

        .db-section-label {
          font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.35);
          letter-spacing: 0.8px; text-transform: uppercase;
          padding: 0 8px; margin-bottom: 6px; white-space: nowrap;
          transition: opacity 0.2s;
        }
        .db-nav {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 12px; border-radius: 8px;
          color: rgba(255,255,255,0.55); text-decoration: none; font-size: 18px;
          transition: background 0.15s, color 0.15s; margin-bottom: 2px;
          white-space: nowrap; overflow: hidden;
        }
        .db-nav:hover { background: rgba(255,255,255,0.06); color: #f0f2ff; }
        .db-nav.active { background: rgba(108,99,255,0.15); color: #f0f2ff; font-weight: 500; }
        .db-nav svg { width: 18px; height: 18px; flex-shrink: 0; }

        .db-nav-new {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 12px; border-radius: 8px;
          color: rgba(255,255,255,0.55); text-decoration: none; font-size: 18px;
          transition: background 0.15s, color 0.15s; margin-bottom: 2px;
          white-space: nowrap; overflow: hidden;
        }
        .db-nav-new:hover { background: rgba(255,255,255,0.06); color: #f0f2ff; }
        .db-nav-new.active { background: rgba(108,99,255,0.15); color: #f0f2ff; font-weight: 500; }
        .db-nav-new svg { width: 18px; height: 18px; flex-shrink: 0; }

        .db-signout {
          margin-top: auto; display: flex; align-items: center; gap: 12px;
          padding: 11px 12px; border-radius: 8px; color: rgba(255,255,255,0.4);
          font-size: 18px; cursor: pointer; transition: background 0.15s, color 0.15s;
          border: none; background: none; width: 100%; text-align: left;
          white-space: nowrap; overflow: hidden;
        }
        .db-signout:hover { background: rgba(255,255,255,0.06); color: #f0f2ff; }
        .db-signout svg { width: 18px; height: 18px; flex-shrink: 0; }
      `}</style>

      <aside className="db-sidebar" style={{ width: sidebarW }}>
        {/* Top — logo + toggle */}
        <div className="db-sidebar-top">
          <div className="db-logo">
            <div className="db-logo-icon">✦</div>
            <span className="db-logo-text" style={{ opacity: collapsed ? 0 : 1 }}>
              MeetScribe
            </span>
          </div>
          <button className="db-toggle-btn" onClick={onToggle} title="Toggle sidebar">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 3v18"/>
            </svg>
          </button>
        </div>

        {/* Nav label */}
        <div className="db-section-label" style={{ opacity: collapsed ? 0 : 1 }}>
          Workspace
        </div>

        {/* Nav links */}
        <Link
          href="/dashboard"
          className={`db-nav ${activeRoute === '/dashboard' ? 'active' : ''}`}
          title="Dashboard"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <span style={{ opacity: collapsed ? 0 : 1 }}>Dashboard</span>
        </Link>

        <Link
          href="/meetings"
          className={`db-nav ${activeRoute === '/meetings' ? 'active' : ''}`}
          title="Meetings"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span style={{ opacity: collapsed ? 0 : 1 }}>Meetings</span>
        </Link>

        <Link
          href="/meetings/new"
          className={`db-nav-new ${activeRoute === '/meetings/new' ? 'active' : ''}`}
          title="New meeting"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M12 4v16m8-8H4"/>
          </svg>
          <span style={{ opacity: collapsed ? 0 : 1 }}>New meeting</span>
        </Link>

        {/* Sign out */}
        <button className="db-signout" onClick={handleSignOut} title="Sign out">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span style={{ opacity: collapsed ? 0 : 1 }}>Sign out</span>
        </button>
      </aside>
    </>
  )
}