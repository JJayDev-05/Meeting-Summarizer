'use client'

import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

export default function MeetingsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarW = collapsed ? 64 : 300

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
        }

        .db-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .db-page-title {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 700;
          color: #f0f2ff;
          margin-bottom: 4px;
        }

        .db-page-sub {
          font-size: 14px;
          font-weight: 300;
          color: rgba(255,255,255,0.4);
        }

        .db-btn-new {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #6c63ff;
          color: #fff;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s, transform 0.2s;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        .db-btn-new:hover {
          background: #5a52e8;
          transform: translateY(-1px);
        }

        .db-empty {
          background: #0d1128;
          border: 1px dashed rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 80px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
        }

        .db-empty-icon {
          color: rgba(255,255,255,0.2);
          margin-bottom: 4px;
        }

        .db-empty-icon svg {
          width: 40px;
          height: 40px;
        }

        .db-empty-title {
          font-size: 15px;
          font-weight: 400;
          color: rgba(255,255,255,0.4);
        }
      `}</style>

      <div className="db-wrap">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          activeRoute="/meetings"
          sidebarW={sidebarW}
        />

        <main
          className="db-main"
          style={{ marginLeft: sidebarW }}
        >
          <div className="db-page-header">
            <div>
              <div className="db-page-title">Meetings</div>

              <div className="db-page-sub">
                Every meeting, summarized and searchable.
              </div>
            </div>

            <Link
              href="/meetings/new"
              className="db-btn-new"
            >
              + New
            </Link>
          </div>

          <div className="db-empty">
            <div className="db-empty-icon">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.2}
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div className="db-empty-title">
              No meetings yet.
            </div>
          </div>
        </main>
      </div>
    </>
  )
}