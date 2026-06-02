'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { MeetingsProvider } from '@/lib/meetings-context'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function MeetingsLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setCollapsed(true)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const sidebarW = isMobile ? 0 : collapsed ? 64 : 300

  return (
    <ErrorBoundary>
      <MeetingsProvider>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#090d1e' }}>
          <Sidebar
            collapsed={isMobile ? false : collapsed}
            onToggle={() => isMobile ? setMobileOpen(false) : setCollapsed(!collapsed)}
            sidebarW={isMobile ? 300 : collapsed ? 64 : 300}
            isMobile={isMobile}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />

          {/* Mobile backdrop */}
          {isMobile && mobileOpen && (
            <div
              onClick={() => setMobileOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(2px)' }}
            />
          )}

          <div style={{ marginLeft: sidebarW, flex: 1, transition: 'margin-left 0.25s ease', minWidth: 0 }}>
            {/* Mobile hamburger */}
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                style={{ position: 'fixed', top: 14, left: 14, zIndex: 60, background: '#0d1128', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}
              >
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} width={18} height={18}>
                  <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            )}
            {children}
          </div>
        </div>
      </MeetingsProvider>
    </ErrorBoundary>
  )
}
