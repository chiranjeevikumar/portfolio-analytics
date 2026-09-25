'use client';

import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import type { Visitor } from '@/lib/api';
import { DEFAULT_VISITORS } from '@/lib/fallbackData';

const PAGE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  portfolio: { label: 'Viewed portfolio', icon: '👁️', color: '#6366f1' },
  project: { label: 'Viewed project', icon: '📁', color: '#8b5cf6' },
  demo_video: { label: 'Watched demo', icon: '▶️', color: '#10b981' },
  github_click: { label: 'Clicked GitHub', icon: '⬡', color: '#64748b' },
  live_demo_click: { label: 'Tried live demo', icon: '🚀', color: '#f59e0b' },
  connect_click: { label: 'Clicked Connect', icon: '🤝', color: '#f43f5e' },
  resume_download: { label: 'Downloaded resume', icon: '📄', color: '#06b6d4' },
};

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>(DEFAULT_VISITORS);
  const [selected, setSelected] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analyticsApi.recentVisitors()
      .then(v => {
        if (v && v.length > 0) setVisitors(v);
      })
      .catch(() => {
        setVisitors(DEFAULT_VISITORS);
      })
      .finally(() => setLoading(false));
  }, []);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div style={{ padding: '40px', maxWidth: 1200 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Visitors</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Every person who visited your portfolio, with their full journey.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80 }} />)}
        </div>
      ) : visitors.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No visitors yet</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Share your portfolio link to start getting visitors.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 24 }}>
          {/* Visitor list */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Recent Visitors ({visitors.length})</h2>
            </div>
            <div>
              {visitors.map((v, i) => (
                <div
                  key={v.id}
                  onClick={() => setSelected(selected?.id === v.id ? null : v)}
                  style={{
                    padding: '16px 24px',
                    borderBottom: i < visitors.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    background: selected?.id === v.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: v.identified_name ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, flexShrink: 0,
                    color: 'white',
                  }}>
                    {v.identified_name ? v.identified_name[0].toUpperCase() : '?'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                      {v.identified_name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Anonymous Visitor</span>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span>📍 {v.city || 'Unknown'}, {v.country || '?'}</span>
                      <span>💻 {v.device_type || 'Unknown'}</span>
                      <span>👁️ {v.visit_count} visit{v.visit_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(v.last_seen)}</div>
                    {v.identified_email && <div style={{ fontSize: 11, color: '#10b981', marginTop: 2 }}>✓ Identified</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Journey panel */}
          {selected && (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 24, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700 }}>Visitor Journey</h2>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>

              <div style={{ padding: 24 }}>
                {/* Visitor info */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: selected.identified_name ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, marginBottom: 12, color: 'white' }}>
                    {selected.identified_name ? selected.identified_name[0].toUpperCase() : '?'}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                    {selected.identified_name || 'Anonymous Visitor'}
                  </div>
                  {selected.identified_email && (
                    <a href={`mailto:${selected.identified_email}`} style={{ fontSize: 14, color: '#a78bfa', textDecoration: 'none' }}>
                      ✉️ {selected.identified_email}
                    </a>
                  )}
                  <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Location', value: `${selected.city || 'Unknown'}, ${selected.country || '?'}` },
                      { label: 'Device', value: selected.device_type || 'Unknown' },
                      { label: 'Browser', value: selected.browser || 'Unknown' },
                      { label: 'Total Visits', value: selected.visit_count },
                      { label: 'First seen', value: formatDate(selected.first_seen) },
                      { label: 'Last seen', value: formatDate(selected.last_seen) },
                    ].map(d => (
                      <div key={d.label} style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{d.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Journey timeline */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Journey</div>
                  {!selected.journey || selected.journey.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No detailed journey data.</p>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      {/* Vertical line */}
                      <div style={{ position: 'absolute', left: 18, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
                      {selected.journey.map((j, idx) => {
                        const meta = PAGE_LABELS[j.page_type] || { label: j.page_type, icon: '📌', color: '#6366f1' };
                        return (
                          <div key={idx} style={{ display: 'flex', gap: 16, marginBottom: 16, position: 'relative' }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${meta.color}22`, border: `2px solid ${meta.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, zIndex: 1 }}>
                              {meta.icon}
                            </div>
                            <div style={{ paddingTop: 6 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: meta.color }}>{meta.label}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {new Date(j.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
