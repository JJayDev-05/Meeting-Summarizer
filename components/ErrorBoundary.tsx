'use client'
import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'Unknown error' }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{ minHeight: '100vh', background: '#090d1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={2} width={26} height={26}>
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#f0f2ff', marginBottom: 10 }}>Something went wrong</div>
          <div style={{ fontSize: 13, color: '#8892b0', marginBottom: 6, lineHeight: 1.6 }}>An unexpected error occurred. Try refreshing the page.</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px', marginBottom: 24, wordBreak: 'break-word' }}>{this.state.message}</div>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '11px 28px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}
          >
            Refresh page
          </button>
        </div>
      </div>
    )
  }
}
