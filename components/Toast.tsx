'use client'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = {
    success: { bg: 'rgba(34,211,165,0.1)', border: 'rgba(34,211,165,0.25)', color: '#22d3a5' },
    error:   { bg: 'rgba(255,80,80,0.1)',  border: 'rgba(255,80,80,0.25)',  color: '#ff6b6b' },
    info:    { bg: 'rgba(108,99,255,0.1)', border: 'rgba(108,99,255,0.25)', color: '#a78bfa' },
  }

  const c = colors[type]

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      background: '#141830', border: `1px solid ${c.border}`,
      borderLeft: `3px solid ${c.color}`,
      borderRadius: '10px', padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      zIndex: 999, maxWidth: '320px',
      animation: 'toastIn 0.25s ease',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <span style={{ fontSize: '14px', color: '#f0f2ff', flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.3)', fontSize: '16px', padding: '0 2px',
        flexShrink: 0,
      }}>✕</button>
    </div>
  )
}