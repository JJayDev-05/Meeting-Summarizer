import Link from "next/link";

export default function Home() {
  const features = [
    { icon: '✦', title: 'Instant summaries', desc: 'Drop in any rambling notes, get a tight 3–5 sentence recap that captures what actually matters.' },
    { icon: '≡', title: 'Decisions captured', desc: 'Never lose what was actually agreed in the room. Every decision is extracted and listed clearly.' },
    { icon: '⊙', title: 'Action items + owners', desc: 'Tasks parsed with the right person attached, ready to ship no more "wait, who was doing that?"' },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0e1f; }

        :root {
          --bg: #0a0e1f;
          --surface: #141830;
          --surface2: #1a1f3a;
          --border: rgba(255,255,255,0.08);
          --border2: rgba(255,255,255,0.14);
          --accent: #6c63ff;
          --accent2: #a78bfa;
          --accent-glow: rgba(108,99,255,0.3);
          --text: #f0f2ff;
          --text-muted: #8892b0;
          --text-dim: #4a5270;
        }

        .ms-wrap {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between
        }

        .ms-wrap::before {
          content: '';
          position: fixed;
          top: -20%; left: 50%;
          transform: translateX(-50%);
          width: 900px; height: 600px;
          background: radial-gradient(ellipse at center, rgba(80,60,200,0.28) 0%, rgba(60,40,180,0.1) 40%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* Nav */
        .ms-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 64px;
          background: rgba(10,14,31,0.75);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .ms-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px;
          color: var(--text); text-decoration: none;
        }
        .ms-logo-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }
        .ms-nav-right { display: flex; align-items: center; gap: 6px; }
        .ms-nav-link {
          padding: 8px 16px; font-size: 14px; color: var(--text-muted);
          text-decoration: none; border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .ms-nav-link:hover { color: var(--text); background: rgba(255,255,255,0.05); }
        .ms-btn-nav {
          padding: 9px 20px; font-size: 14px; font-weight: 500;
          background: var(--accent); color: #fff; border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 0 20px var(--accent-glow);
          transition: all 0.2s;
        }
        .ms-btn-nav:hover { background: #5a52e8; transform: translateY(-1px); }

        /* Hero */
        .ms-hero {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 160px 24px 72px;
          min-height: auto;
        }

        .ms-hero h1 {
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-size: clamp(48px, 8vw, 108px);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -2px;
          margin-bottom: 28px;
        }
        .ms-line1 { display: block; color: var(--text); }
        .ms-line2 {
          display: block;
          background: linear-gradient(90deg, var(--accent2) 0%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ms-hero-sub {
          max-width: 580px;
          font-size: 17px; font-weight: 300; line-height: 1.75;
          color: var(--text-muted);
          margin-bottom: 44px;
        }

        .ms-cta-row {
          display: flex; align-items: center; gap: 12px;
          flex-wrap: wrap; justify-content: center;
        }
        .ms-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; font-size: 15px; font-weight: 500;
          background: var(--accent); color: #fff;
          border-radius: 12px; text-decoration: none;
          box-shadow: 0 0 28px var(--accent-glow);
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .ms-btn-primary:hover { background: #5a52e8; transform: translateY(-1px); }
        .ms-btn-secondary {
          display: inline-flex; align-items: center;
          padding: 14px 28px; font-size: 15px; font-weight: 500;
          background: rgba(10,10,20,0.8);
          color: var(--text); border: 1px solid var(--border2);
          border-radius: 12px; text-decoration: none;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .ms-btn-secondary:hover { background: rgba(255,255,255,0.06); }

        /* Feature cards */
        .ms-features {
          position: relative; z-index: 1;
          max-width: 1100px; margin: 0 auto;
          padding: 0 24px 40px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .ms-card {
          background: rgba(20, 24, 48, 0.7);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 32px 28px;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }
        .ms-card:hover {
          border-color: rgba(108,99,255,0.3);
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }

        .ms-card-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: var(--surface2);
          border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; color: var(--accent2);
          margin-bottom: 20px;
          font-family: 'Syne', sans-serif; font-weight: 700;
        }
        .ms-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 600;
          color: var(--text); margin-bottom: 10px;
        }
        .ms-card-desc {
          font-size: 14px; font-weight: 300;
          color: var(--text-muted); line-height: 1.7;
        }

        /* Footer */
        .ms-footer {
          position: relative; z-index: 1;
          border-top: 1px solid var(--border);
          padding: 24px 40px;
          display: flex; align-items: center; justify-content: space-between;
          font-size: 13px; color: var(--text-dim);
        }

        @media (max-width: 768px) {
          .ms-nav { padding: 0 20px; }
          .ms-features { grid-template-columns: 1fr; }
          .ms-footer { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>

      <div className="ms-wrap">

        {/* Nav */}
        <nav className="ms-nav">
          <Link href="/" className="ms-logo">
            <img src="/logo.png" alt="MeetScribe" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'contain' }} />
            MeetScribe
          </Link>
          <div className="ms-nav-right">
            <Link href="/login" className="ms-nav-link">Sign in</Link>
            <Link href="/signup" className="ms-btn-nav">Get started</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="ms-hero">
          <h1>
            <span className="ms-line1">Messy notes in.</span>
            <span className="ms-line2">Clear decisions out.</span>
          </h1>
          <p className="ms-hero-sub">
            Paste your raw meeting notes and get a clean summary, the decisions made, and action items with owners in seconds. Your team never loses context again.
          </p>
          <div className="ms-cta-row">
            <Link href="/signup" className="ms-btn-primary">
              Start summarizing free →
            </Link>
            <Link href="/login" className="ms-btn-secondary">
              I have an account
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <div className="ms-features" id="features">
          {features.map((f) => (
            <div className="ms-card" key={f.title}>
              <div className="ms-card-icon">{f.icon}</div>
              <div className="ms-card-title">{f.title}</div>
              <div className="ms-card-desc">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="ms-footer">
          <span>✦ MeetScribe</span>
          <span>Built with Next.js · Supabase</span>
        </footer>

      </div>
    </>
  );
}