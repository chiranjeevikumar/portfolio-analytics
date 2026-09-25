'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div className="orb" style={{ width: 600, height: 600, background: 'rgba(99,102,241,0.08)', top: -200, right: -200 }} />
      <div className="orb" style={{ width: 400, height: 400, background: 'rgba(139,92,246,0.06)', bottom: -100, left: -100 }} />

      {/* Nav */}
      <nav style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>PortfolioIQ</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/chiru"><button className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}>View Portfolio →</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '100px 40px 80px', textAlign: 'center', position: 'relative', zIndex: 5 }}>
        <div className="badge" style={{ margin: '0 auto 24px', width: 'fit-content' }}>
          <span>✨</span> Portfolio Analytics + Lead Intelligence
        </div>
        <h1 style={{ fontSize: 'clamp(40px,6vw,72px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24, maxWidth: 900, margin: '0 auto 24px' }}>
          Your portfolio is your{' '}
          <span className="gradient-text">smartest salesperson</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 48px', lineHeight: 1.7 }}>
          Live showcase and visitor intelligence dashboard for <strong>Chiranjeevi Kumar Battula</strong> — AI/ML Engineer at KPMG.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/chiru"><button className="btn-primary" style={{ padding: '16px 36px', fontSize: 16 }}>Explore Chiranjeevi&apos;s Portfolio →</button></Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '40px', display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 5 }}>
        {[
          { label: 'Professionals using PortfolioIQ', value: '1,200+', icon: '👥' },
          { label: 'Visitor events tracked', value: '486K+', icon: '📊' },
          { label: 'Leads generated', value: '8,400+', icon: '🤝' },
        ].map((s) => (
          <div key={s.label} className="glass-card" style={{ padding: '24px 32px', textAlign: 'center', minWidth: 200 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#a78bfa' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>Everything in one link</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 56 }}>Share your portfolio. Get intelligence. Convert visitors.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
          {[
            {
              icon: '🌐', title: 'Public Portfolio', color: '#6366f1',
              desc: 'Stunning profile page with projects, demos, GitHub links, resume, and skills. Share as yourname.vercel.app.',
              points: ['Profile & bio', 'Featured projects', 'Demo videos', 'Live demos & GitHub', 'Resume download']
            },
            {
              icon: '👁️', title: 'Visitor Intelligence', color: '#8b5cf6',
              desc: 'Know who\'s visiting, from where, what they viewed, and how long. Turn anonymous traffic into insights.',
              points: ['Real-time tracking', 'Location & device', 'Visitor journey', 'Project analytics', 'Daily charts']
            },
            {
              icon: '🤝', title: 'Lead Generation', color: '#10b981',
              desc: 'Convert visitors into leads with a professional connect flow. Get notified instantly for every connection.',
              points: ['Connect form', 'Interest categories', 'Email notifications', 'Lead management', 'Reply tracking']
            },
            {
              icon: '📊', title: 'Private Dashboard', color: '#f59e0b',
              desc: 'Your control center. Analytics, visitor activity, lead inbox, and project performance — all in one place.',
              points: ['KPI overview', 'Activity feed', 'Visitor journeys', 'Connection inbox', 'Notification settings']
            },
          ].map((f) => (
            <div key={f.title} className="glass-card" style={{ padding: 28 }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: f.color }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>{f.desc}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {f.points.map((p) => (
                  <li key={p} style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: f.color }}>✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center', position: 'relative', zIndex: 5 }}>
        <div className="glass-card" style={{ maxWidth: 600, margin: '0 auto', padding: '56px 40px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>Ready to go beyond a static resume?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Built with FastAPI + Next.js. Ready for production visitor intelligence.</p>
          <Link href="/chiru"><button className="btn-primary" style={{ padding: '16px 40px', fontSize: 16 }}>Explore Portfolio & Demos →</button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 13, borderTop: '1px solid var(--border)' }}>
        © 2026 PortfolioIQ — Built with FastAPI + Next.js
      </footer>
    </div>
  );
}
