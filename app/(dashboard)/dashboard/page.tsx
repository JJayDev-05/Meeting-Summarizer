'use client'
import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

export default function DashboardPage() {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarW = collapsed ? 64 : 300

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #090d1e; }
        .db-wrap { display: flex; min-height: 100vh; font-family: 'DM Sans', sans-serif; background: #090d1e; color: #f0f2ff; }
        .db-main { flex: 1; padding: 40px 48px; transition: margin-left 0.25s ease; }
        .db-topbar { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; }
        .db-page-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; color: #f0f2ff; margin-bottom: 4px; }
        .db-page-sub { font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.4); }
        .db-btn-new { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #6c63ff; color: #fff; border-radius: 10px; font-size: 14px; font-weight: 500; text-decoration: none; transition: background 0.2s, transform 0.2s; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        .db-btn-new:hover { background: #5a52e8; transform: translateY(-1px); }
        .db-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 40px; }
        .db-stat-card { background: #141830; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
        .db-stat-label { font-size: 14px; color: rgba(255,255,255,0.5); margin-bottom: 16px; }
        .db-stat-num { font-size: 36px; font-weight: 400; color: #f0f2ff; }
        .db-stat-icon { width: 36px; height: 36px; border-radius: 8px; background: rgba(108,99,255,0.15); display: flex; align-items: center; justify-content: center; }
        .db-stat-icon svg { width: 18px; height: 18px; color: #a78bfa; }
        .db-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .db-section-title { font-size: 18px; font-weight: 500; color: #f0f2ff; }
        .db-view-all { font-size: 14px; color: #a78bfa; text-decoration: none; }
        .db-view-all:hover { text-decoration: underline; }
        .db-empty { background: #141830; border: 1px dashed rgba(255,255,255,0.12); border-radius: 14px; padding: 60px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; }
        .db-empty-icon { width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, #6c63ff, #a78bfa); display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 8px; }
        .db-empty-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #f0f2ff; }
        .db-empty-sub { font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
      `}</style>

      <div className="db-wrap">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          activeRoute="/dashboard"
          sidebarW={sidebarW}
        />

        <main className="db-main" style={{ marginLeft: sidebarW }}>
          <div className="db-topbar">
            <div>
              <div className="db-page-title">Dashboard</div>
              <div className="db-page-sub">Your meeting intelligence at a glance.</div>
            </div>
            <Link href="/meetings/new" className="db-btn-new">+ New meeting</Link>
          </div>

          <div className="db-stats">
            <div className="db-stat-card">
              <div>
                <div className="db-stat-label">Meetings</div>
                <div className="db-stat-num">0</div>
              </div>
              <div className="db-stat-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
            </div>
            <div className="db-stat-card">
              <div>
                <div className="db-stat-label">Action items</div>
                <div className="db-stat-num">0</div>
              </div>
              <div className="db-stat-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
              </div>
            </div>
            <div className="db-stat-card">
              <div>
                <div className="db-stat-label">Decisions captured</div>
                <div className="db-stat-num">0</div>
              </div>
              <div className="db-stat-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
              </div>
            </div>
          </div>

          <div className="db-section-header">
            <div className="db-section-title">Recent meetings</div>
            <Link href="/meetings" className="db-view-all">View all</Link>
          </div>

          <div className="db-empty">
            <div className="db-empty-icon">✦</div>
            <div className="db-empty-title">No meetings yet</div>
            <div className="db-empty-sub">Drop in your first set of notes and let AI handle the rest.</div>
            <Link href="/meetings/new" className="db-btn-new">+ New meeting</Link>
          </div>
        </main>
      </div>
    </>
  )
}