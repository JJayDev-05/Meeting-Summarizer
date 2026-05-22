'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset() {
    if (!email.trim()) { alert('Please enter your email'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) { alert(error.message); return }
    setSent(true)
  }

  return (
    <>
      <style>{`
        .auth-bg { min-height: 100vh; background: #090d1e; background-image: radial-gradient(ellipse at 50% 0%, rgba(80,60,200,0.25) 0%, transparent 60%); display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; padding: 24px; }
        .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; text-decoration: none; }
        .auth-logo-icon { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #6c63ff, #a78bfa); display: flex; align-items: center; justify-content: center; font-size: 16px; color: #fff; }
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
        .auth-success { text-align: center; padding: 20px 0; }
        .auth-success-icon { font-size: 32px; margin-bottom: 12px; }
        .auth-success-text { font-size: 15px; color: #22d3a5; margin-bottom: 8px; }
        .auth-success-sub { font-size: 13px; color: #8892b0; }
      `}</style>

      <div className="auth-bg">
        <Link href="/" className="auth-logo">
          <div className="auth-logo-icon">✦</div>
          <span className="auth-logo-text">MeetScribe</span>
        </Link>
        <div className="auth-card">
          <div className="auth-title">Reset password</div>
          <div className="auth-subtitle">Enter your email and we'll send a reset link</div>

          {sent ? (
            <div className="auth-success">
              <div className="auth-success-icon">✉️</div>
              <div className="auth-success-text">Check your email</div>
              <div className="auth-success-sub">We sent a password reset link to {email}</div>
            </div>
          ) : (
            <>
              <label className="auth-label">Email</label>
              <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              <button className="auth-btn" onClick={handleReset} disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </>
          )}

          <div className="auth-footer">
            <Link href="/login">← Back to sign in</Link>
          </div>
        </div>
      </div>
    </>
  )
}