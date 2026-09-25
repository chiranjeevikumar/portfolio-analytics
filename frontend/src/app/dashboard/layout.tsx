'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const currentUser = user || {
    id: 'be000031-d0e3-49cf-9544-859b365ebf8d',
    username: 'chiranjeevi',
    email: 'chiranjeevi4205@gmail.com',
  };

  const navItems = [
    { href: '/dashboard', icon: '📊', label: 'Overview' },
    { href: '/dashboard/analytics', icon: '📈', label: 'Analytics' },
    { href: '/dashboard/visitors', icon: '👥', label: 'Visitors' },
    { href: '/dashboard/connections', icon: '🤝', label: 'Connections' },
    { href: '/dashboard/projects', icon: '🚀', label: 'Projects' },
    { href: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'rgba(13,13,30,0.95)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px', marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>PortfolioIQ</span>
        </div>

        {/* User */}
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 24 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
            {currentUser.username[0].toUpperCase()}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{currentUser.username}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{currentUser.email}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div className="nav-item" id={`nav-${item.label.toLowerCase()}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Public link */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
          <Link href={`/chiru`} target="_blank" style={{ textDecoration: 'none' }}>
            <div className="nav-item" style={{ background: 'rgba(99,102,241,0.06)' }}>
              <span>🌐</span>
              <span style={{ fontSize: 13 }}>View Portfolio</span>
              <span style={{ marginLeft: 'auto', fontSize: 11 }}>↗</span>
            </div>
          </Link>
          <button
            id="logout-btn"
            onClick={logout}
            className="nav-item"
            style={{ width: '100%', border: 'none', marginTop: 4, justifyContent: 'flex-start', color: '#f43f5e' }}
          >
            <span>🚪</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh', position: 'relative' }}>
        {children}
      </main>
    </div>
  );
}
