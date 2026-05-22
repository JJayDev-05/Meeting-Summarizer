interface PageLoaderProps {
  text?: string
}

export default function PageLoader({ text = 'Loading...' }: PageLoaderProps) {
  return (
    <>
      <style>{`
        .page-loader {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px; min-height: 60vh;
          animation: loaderFadeIn 0.2s ease;
        }
        .page-loader-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: linear-gradient(135deg, #6c63ff, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; color: #fff;
          animation: loaderPulse 1.5s ease-in-out infinite;
        }
        .page-loader-spinner {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid rgba(108,99,255,0.2);
          border-top-color: #6c63ff;
          animation: loaderSpin 0.8s linear infinite;
        }
        .page-loader-text {
          font-size: 14px; font-weight: 300;
          color: rgba(255,255,255,0.3);
          font-family: 'DM Sans', sans-serif;
        }
        @keyframes loaderFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes loaderPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.9); opacity: 0.7; }
        }
        @keyframes loaderSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-loader">
        <img src="/logo.png" alt="MeetScribe" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'contain' }} />
        <div className="page-loader-spinner" />
        <div className="page-loader-text">{text}</div>
      </div>
    </>
  )
}