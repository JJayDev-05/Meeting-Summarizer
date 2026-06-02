'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset() {
    if (!email.trim()) { setError('Please enter your email.'); return }
    setLoading(true)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');
        .auth-bg { min-height: 100vh; background: #090d1e; background-image: radial-gradient(ellipse at 50% 0%, rgba(80,60,200,0.25) 0%, transparent 60%); display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; padding: 24px; }
        .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; text-decoration: none; }
        .auth-logo-text { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #f0f2ff; }
        .auth-card { width: 100%; max-width: 440px; background: rgba(20,24,50,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 36px 32px; }
        .auth-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #f0f2ff; margin-bottom: 6px; }
        .auth-subtitle { font-size: 14px; font-weight: 300; color: #8892b0; margin-bottom: 28px; }
        .auth-label { display: block; font-size: 13px; font-weight: 500; color: #c8cde8; margin-bottom: 7px; }
        .auth-input { width: 100%; padding: 11px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: #f0f2ff; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; margin-bottom: 18px; }
        .auth-input:focus { border-color: rgba(108,99,255,0.6); }
        .auth-input::placeholder { color: #4a5270; }
        .auth-btn { width: 100%; padding: 13px; background: #6c63ff; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.2s, transform 0.2s; margin-bottom: 20px; }
        .auth-btn:hover:not(:disabled) { background: #5a52e8; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .auth-footer { text-align: center; font-size: 14px; font-weight: 300; color: #8892b0; }
        .auth-footer a { color: #a78bfa; text-decoration: none; }
        .auth-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .auth-modal { background: #141830; border: 1px solid rgba(248,113,113,0.25); border-radius: 16px; padding: 28px 28px 24px; width: 100%; max-width: 360px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .auth-modal-icon { width: 40px; height: 40px; border-radius: 50%; background: rgba(248,113,113,0.12); display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .auth-modal-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: #f0f2ff; margin-bottom: 8px; }
        .auth-modal-msg { font-size: 14px; color: #8892b0; line-height: 1.55; margin-bottom: 22px; }
        .auth-modal-btn { width: 100%; padding: 11px; background: #6c63ff; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; }
      `}</style>

      {error && (
        <div className="auth-modal-overlay" onClick={() => setError('')}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <div className="auth-modal-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth={2} width={20} height={20}>
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <div className="auth-modal-title">Something went wrong</div>
            <div className="auth-modal-msg">{error}</div>
            <button className="auth-modal-btn" onClick={() => setError('')}>OK</button>
          </div>
        </div>
      )}

      <div className="auth-bg">
        <Link href="/" className="auth-logo">
          <img src="/logo.png" alt="Meeting Summarizer" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'contain' }} />
          <span className="auth-logo-text">Meeting Summarizer</span>
        </Link>
        <div className="auth-card">
          <div className="auth-title">Reset password</div>
          <div className="auth-subtitle">Enter your email and we'll send a reset link</div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
              <div style={{ fontSize: 15, color: '#22d3a5', marginBottom: 8 }}>Check your email</div>
              <div style={{ fontSize: 13, color: '#8892b0' }}>We sent a password reset link to {email}</div>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); handleReset() }} noValidate>
              <label className="auth-label">Email</label>
              <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <Link href="/login">← Back to sign in</Link>
          </div>
        </div>
      </div>
    </>
  )
}
