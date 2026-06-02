'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { MeetingsProvider } from '@/lib/meetings-context'

export default function MeetingsLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarW = collapsed ? 64 : 300

  return (
    <MeetingsProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#090d1e' }}>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          sidebarW={sidebarW}
        />
        <div style={{ marginLeft: sidebarW, flex: 1, transition: 'margin-left 0.25s ease' }}>
          {children}
        </div>
      </div>
    </MeetingsProvider>
  )
}