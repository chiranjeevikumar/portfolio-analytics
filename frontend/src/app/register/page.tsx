'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 20 }}>
      <div className="orb" style={{ width: 500, height: 500, background: 'rgba(99,102,241,0.08)', top: -150, right: -150 }} />
      <div className="orb" style={{ width: 300, height: 300, background: 'rgba(139,92,246,0.06)', bottom: -100, left: -50 }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
              <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>PortfolioIQ</span>
            </div>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Create your portfolio</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Set up in 2 minutes. Start tracking visitors instantly.</p>
        </div>

        <div className="glass-card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {error && (
              <div className="alert-error" style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid', fontSize: 14 }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Full Name</label>
              <input id="reg-name" className="input-field" type="text" placeholder="ABC Kumar" value={form.name} onChange={set('name')} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Username <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(your portfolio URL)</span></label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>yourapp.com/</span>
                <input id="reg-username" className="input-field" type="text" placeholder="abc" value={form.username} onChange={set('username')} required style={{ paddingLeft: 120 }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Email address</label>
              <input id="reg-email" className="input-field" type="email" placeholder="abc@example.com" value={form.email} onChange={set('email')} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(min 8 chars)</span></label>
              <input id="reg-password" className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={8} />
            </div>

            <button id="reg-submit" className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: 15 }}>
              {loading ? 'Creating account...' : 'Create portfolio →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#a78bfa', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
