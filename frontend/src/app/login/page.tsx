'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 20 }}>
      {/* Background orbs */}
      <div className="orb" style={{ width: 500, height: 500, background: 'rgba(99,102,241,0.08)', top: -150, right: -150 }} />
      <div className="orb" style={{ width: 300, height: 300, background: 'rgba(139,92,246,0.06)', bottom: -100, left: -50 }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/chiru" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
              <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: '#fff' }}>PortfolioIQ</span>
            </div>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Admin Sign In</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Chiranjeevi Kumar Battula • Intelligence & Analytics</p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          {/* Demo Admin Preset Alert */}
          <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Admin Access Credentials</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('chiranjeevi4205@gmail.com');
                  setPassword('12345678');
                }}
                style={{
                  background: 'rgba(99, 102, 241, 0.3)',
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                ⚡ 1-Click Autofill
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <div><strong>Email:</strong> <code>chiranjeevi4205@gmail.com</code></div>
              <div><strong>Password:</strong> <code>12345678</code></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div className="alert-error" style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid', fontSize: 14 }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Email address</label>
              <input
                id="login-email"
                className="input-field"
                type="email"
                placeholder="chiranjeevi4205@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Password</label>
              <input
                id="login-password"
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              id="login-submit"
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: 15 }}
            >
              {loading ? 'Signing in as Admin...' : 'Sign In as Admin →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 13 }}>
            🔒 Public registration is disabled. Protected administrative area for Chiranjeevi.
          </div>
        </div>
      </div>
    </div>
  );
}
