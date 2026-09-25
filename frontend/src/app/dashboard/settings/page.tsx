'use client';

import { useEffect, useState } from 'react';
import { profileApi } from '@/lib/api';
import type { Profile } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'notifications'>('profile');

  useEffect(() => {
    profileApi.getMe().then(p => {
      setProfile(p);
      setForm(p);
    }).finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await profileApi.updateMe(form);
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  function addSkill() {
    if (!skillInput.trim()) return;
    const skills = [...(form.skills as string[] || []), skillInput.trim()];
    setForm(f => ({ ...f, skills }));
    setSkillInput('');
  }

  function removeSkill(idx: number) {
    setForm(f => ({ ...f, skills: (f.skills as string[]).filter((_, i) => i !== idx) }));
  }

  if (loading) return <div style={{ padding: 40 }}><div className="skeleton" style={{ height: 300 }} /></div>;

  const tabs = [
    { key: 'profile', label: '👤 Profile' },
    { key: 'contact', label: '📞 Contact & Privacy' },
    { key: 'notifications', label: '🔔 Notifications' },
  ] as const;

  return (
    <div style={{ padding: '40px', maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your public portfolio URL:{' '}
          <a href={`/${user?.username}`} target="_blank" style={{ color: '#a78bfa', textDecoration: 'none' }}>
            yourapp.com/{user?.username}
          </a>
        </p>
      </div>

      {saved && (
        <div className="alert-success" style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid', marginBottom: 24, fontSize: 14 }}>
          ✓ Profile saved successfully!
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
        {tabs.map(t => (
          <button key={t.key} id={`tab-${t.key}`} onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 20px', borderRadius: 8, border: '1px solid',
              borderColor: activeTab === t.key ? '#6366f1' : 'var(--border)',
              background: activeTab === t.key ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: activeTab === t.key ? '#a78bfa' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s'
            }}
          >{t.label}</button>
        ))}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {activeTab === 'profile' && (
          <div className="glass-card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 24 }}>Public Profile Info</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                <input id="set-name" className="input-field" type="text" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Title</label>
                <input id="set-title" className="input-field" type="text" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="AI/ML Engineer" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Company</label>
                <input id="set-company" className="input-field" type="text" value={form.company || ''} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="XYZ Technologies" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience (years)</label>
                <input id="set-exp" className="input-field" type="number" value={form.experience_years || ''} onChange={e => setForm(f => ({ ...f, experience_years: parseInt(e.target.value) }))} />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bio</label>
              <textarea id="set-bio" className="input-field" rows={4} value={form.bio || ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell visitors about yourself, your expertise, and what you build..." style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avatar URL</label>
                <input id="set-avatar" className="input-field" type="url" value={form.avatar_url || ''} onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resume URL</label>
                <input id="set-resume" className="input-field" type="url" value={form.resume_url || ''} onChange={e => setForm(f => ({ ...f, resume_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>LinkedIn URL</label>
                <input id="set-linkedin" className="input-field" type="url" value={form.linkedin_url || ''} onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>GitHub URL</label>
                <input id="set-github" className="input-field" type="url" value={form.github_url || ''} onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))} placeholder="https://github.com/..." />
              </div>
            </div>

            {/* Skills */}
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Skills</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input id="skill-input" className="input-field" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="Python, FastAPI, React... (Enter to add)" style={{ flex: 1 }} />
                <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={addSkill}>Add</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(form.skills as string[] || []).map((s, i) => (
                  <span key={i} className="tech-pill" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => removeSkill(i)}>
                    {s} <span style={{ color: '#f43f5e', fontSize: 12 }}>×</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="glass-card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Contact Information & Privacy</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Control what contact info is visible on your public portfolio.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Public Email</label>
                <input id="set-email-contact" className="input-field" type="email" value={form.email_contact || ''} onChange={e => setForm(f => ({ ...f, email_contact: e.target.value }))} placeholder="abc@example.com" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <input id="email-visible" type="checkbox" checked={form.email_visible || false} onChange={e => setForm(f => ({ ...f, email_visible: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
                  <label htmlFor="email-visible" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>Show email publicly on portfolio</label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</label>
                <input id="set-phone" className="input-field" type="tel" value={form.phone_contact || ''} onChange={e => setForm(f => ({ ...f, phone_contact: e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <input id="phone-visible" type="checkbox" checked={form.phone_visible || false} onChange={e => setForm(f => ({ ...f, phone_visible: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#6366f1' }} />
                  <label htmlFor="phone-visible" style={{ fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>Show phone publicly on portfolio</label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="glass-card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Email Notifications</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Choose when you want to receive email alerts via Resend.</p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notification Email</label>
              <input id="set-notify-email" className="input-field" type="email" value={form.notify_email || ''} onChange={e => setForm(f => ({ ...f, notify_email: e.target.value }))} placeholder="abc@example.com" />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Leave blank to use your account email.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { id: 'notify-visit', key: 'notify_on_visit', label: '👁️ Portfolio visit notifications', desc: 'Get an email whenever someone visits your portfolio' },
                { id: 'notify-connect', key: 'notify_on_connect', label: '🤝 Connection request notifications', desc: 'Get an email when someone submits a connect request' },
              ].map(n => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--bg-card)', borderRadius: 10 }}>
                  <input id={n.id} type="checkbox" checked={(form as any)[n.key] || false}
                    onChange={e => setForm(f => ({ ...f, [n.key]: e.target.checked }))}
                    style={{ width: 20, height: 20, accentColor: '#6366f1', flexShrink: 0 }} />
                  <label htmlFor={n.id} style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{n.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{n.desc}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <button id="save-settings-btn" className="btn-primary" type="submit" disabled={saving} style={{ padding: '14px 32px', fontSize: 15, width: 'fit-content' }}>
          {saving ? 'Saving...' : '✓ Save Changes'}
        </button>
      </form>
    </div>
  );
}
