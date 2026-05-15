'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { alert(error.message); setLoading(false); return }
    alert('Check your email to confirm your account!')
    router.push('/login')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .auth-bg {
          min-height: 100vh;
          background: #090d1e;
          background-image: radial-gradient(ellipse at 50% 0%, rgba(80,60,200,0.25) 0%, transparent 60%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          padding: 24px;
        }

        .auth-logo {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 32px;
          text-decoration: none;
        }
        .auth-logo-icon {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #6c63ff, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; color: #fff;
        }
        .auth-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 700;
          color: #f0f2ff;
        }

        .auth-card {
          width: 100%; max-width: 440px;
          background: rgba(20, 24, 50, 0.8);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px;
          padding: 36px 32px;
        }

        .auth-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 700;
          color: #f0f2ff;
          margin-bottom: 6px;
        }
        .auth-subtitle {
          font-size: 14px; font-weight: 300;
          color: #8892b0;
          margin-bottom: 28px;
        }

        .auth-label {
          display: block;
          font-size: 13px; font-weight: 500;
          color: #c8cde8;
          margin-bottom: 7px;
        }
        .auth-input {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #f0f2ff;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          margin-bottom: 18px;
        }
        .auth-input:focus { border-color: rgba(108,99,255,0.6); }
        .auth-input::placeholder { color: #4a5270; }

        .auth-btn {
          width: 100%;
          padding: 13px;
          background: #6c63ff;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          margin-bottom: 20px;
        }
        .auth-btn:hover:not(:disabled) { background: #5a52e8; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-footer {
          text-align: center;
          font-size: 14px; font-weight: 300;
          color: #8892b0;
        }
        .auth-footer a { color: #a78bfa; text-decoration: none; }
        .auth-footer a:hover { text-decoration: underline; }
      `}</style>

      <div className="auth-bg">
        <div className="auth-logo">
          <div className="auth-logo-icon">✦</div>
            <span className="auth-logo-text">MeetScribe</span>
        </div>

        <div className="auth-card">
          <div className="auth-title">Create your account</div>
          <div className="auth-subtitle">Start summarizing meetings in seconds</div>

          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <label className="auth-label">Password</label>
          <input
            className="auth-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button className="auth-btn" onClick={handleSignup} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="auth-footer">
            Already a member? <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  )
}