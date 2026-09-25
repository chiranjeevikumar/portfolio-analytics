'use client';

import { useEffect, useState } from 'react';
import { connectionsApi } from '@/lib/api';
import type { Connection } from '@/lib/api';

const INTEREST_ICONS: Record<string, string> = {
  job_opportunity: '💼',
  freelance: '🚀',
  collaboration: '🤝',
  discussion: '💬',
  other: '✨',
};

const STATUS_COLORS: Record<string, string> = {
  new: '#f59e0b',
  read: '#6366f1',
  replied: '#10b981',
  archived: '#64748b',
};

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Connection | null>(null);

  useEffect(() => {
    connectionsApi.list().then(setConnections).finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: string, status: string) {
    await connectionsApi.updateStatus(id, status);
    setConnections(cs => cs.map(c => c.id === id ? { ...c, status } : c));
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : null);
  }

  const filtered = filter === 'all' ? connections : connections.filter(c => c.status === filter);

  const counts = connections.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div style={{ padding: '40px', maxWidth: 1200 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Connections</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Lead inbox — people who want to connect with you.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total', count: connections.length, color: '#6366f1' },
          { label: 'New', count: counts.new || 0, color: '#f59e0b' },
          { label: 'Replied', count: counts.replied || 0, color: '#10b981' },
          { label: 'Archived', count: counts.archived || 0, color: '#64748b' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.count}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['all', 'new', 'read', 'replied', 'archived'].map(f => (
          <button key={f} id={`filter-${f}`} onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid',
              borderColor: filter === f ? '#6366f1' : 'var(--border)',
              background: filter === f ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: filter === f ? '#a78bfa' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', textTransform: 'capitalize'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No connections yet</h2>
          <p style={{ color: 'var(--text-secondary)' }}>When visitors click "Connect", they'll appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: 24 }}>
          {/* Connection list */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            {filtered.map((conn, i) => (
              <div
                key={conn.id}
                onClick={() => { setSelected(selected?.id === conn.id ? null : conn); if (conn.status === 'new') updateStatus(conn.id, 'read'); }}
                style={{
                  padding: '20px 24px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  background: selected?.id === conn.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                  transition: 'background 0.2s',
                  position: 'relative',
                }}
              >
                {conn.status === 'new' && (
                  <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {conn.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: 16, fontWeight: 700 }}>{conn.name}</span>
                        <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--text-muted)' }}>{conn.email}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: STATUS_COLORS[conn.status], background: `${STATUS_COLORS[conn.status]}22`, padding: '2px 10px', borderRadius: 100, fontWeight: 600 }}>
                          {conn.status}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(conn.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span>{INTEREST_ICONS[conn.interest_type] || '✨'}</span>
                      <span style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600, textTransform: 'capitalize' }}>
                        {conn.interest_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p style={{ marginTop: 6, fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{conn.message}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 24, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700 }}>Connection Detail</h2>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, marginBottom: 16, color: 'white' }}>
                  {selected.name[0].toUpperCase()}
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{selected.name}</h2>
                <a href={`mailto:${selected.email}`} style={{ color: '#a78bfa', fontSize: 14, textDecoration: 'none' }}>✉️ {selected.email}</a>

                <div style={{ marginTop: 20, padding: '14px', background: 'var(--bg-card)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{INTEREST_ICONS[selected.interest_type] || '✨'}</span>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>INTERESTED IN</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#a78bfa', textTransform: 'capitalize' }}>{selected.interest_type.replace('_', ' ')}</div>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message</div>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: 16, fontSize: 14, lineHeight: 1.7, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    "{selected.message}"
                  </div>
                </div>

                {/* Status actions */}
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Update Status</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {['read', 'replied', 'archived'].map(s => (
                      <button
                        key={s}
                        id={`status-${s}`}
                        onClick={() => updateStatus(selected.id, s)}
                        style={{
                          padding: '10px', borderRadius: 8, border: '1px solid',
                          borderColor: selected.status === s ? STATUS_COLORS[s] : 'var(--border)',
                          background: selected.status === s ? `${STATUS_COLORS[s]}22` : 'transparent',
                          color: selected.status === s ? STATUS_COLORS[s] : 'var(--text-secondary)',
                          cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                          transition: 'all 0.2s',
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reply button */}
                <a href={`mailto:${selected.email}?subject=Re: Your connection request`} style={{ textDecoration: 'none', display: 'block', marginTop: 20 }}>
                  <button id="reply-btn" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15 }}>
                    ✉️ Reply to {selected.name.split(' ')[0]}
                  </button>
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
