'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export interface ActionItem {
  id: string
  task: string
  owner: string | null
  due_date: string | null
  is_done: boolean
}

export interface Meeting {
  id: string
  title: string
  meeting_date: string | null
  raw_notes: string | null
  ai_summary: string | null
  ai_decisions: string | null
  created_at: string
  action_items: ActionItem[]
}

interface MeetingsContextType {
  meetings: Meeting[]
  initialized: boolean
  refresh: () => void
  updateMeeting: (id: string, updates: Partial<Meeting>) => void
  removeMeeting: (id: string) => void
}

const MeetingsContext = createContext<MeetingsContextType | null>(null)

export function MeetingsProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [initialized, setInitialized] = useState(false)

  const refresh = useCallback(() => {
    fetch('/api/meetings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMeetings(data)
          setInitialized(true)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener('meeting-saved', refresh)
    return () => window.removeEventListener('meeting-saved', refresh)
  }, [refresh])

  const updateMeeting = useCallback((id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
  }, [])

  const removeMeeting = useCallback((id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id))
  }, [])

  return (
    <MeetingsContext.Provider value={{ meetings, initialized, refresh, updateMeeting, removeMeeting }}>
      {children}
    </MeetingsContext.Provider>
  )
}

export function useMeetings() {
  const ctx = useContext(MeetingsContext)
  if (!ctx) throw new Error('useMeetings must be used within MeetingsProvider')
  return ctx
}
