'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 20 }}>
      <div className="orb" style={{ width: 500, height: 500, background: 'rgba(99,102,241,0.08)', top: -150, right: -150 }} />
      <div className="orb" style={{ width: 300, height: 300, background: 'rgba(139,92,246,0.06)', bottom: -100, left: -50 }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/chiru" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
              <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: '#fff' }}>PortfolioIQ</span>
            </div>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Registration Restricted</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Private Portfolio & Intelligence Dashboard</p>
        </div>

        <div className="glass-card" style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#e0e7ff' }}>
            Public Registration is Disabled
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            This application is configured as a dedicated personal portfolio and visitor intelligence system for <strong>Chiranjeevi Kumar Battula</strong>. Account creation is by admin invite only.
          </p>

          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15 }}>
              Proceed to Admin Sign In →
            </button>
          </Link>

          <div style={{ marginTop: 20 }}>
            <Link href="/chiru" style={{ color: '#a78bfa', fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>
              ← Return to Chiranjeevi&apos;s Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
