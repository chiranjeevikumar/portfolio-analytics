'use client';

import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import type { ChartRow, TopProject } from '@/lib/api';
import { DEFAULT_CHART, DEFAULT_TOP_PROJECTS } from '@/lib/fallbackData';

export default function AnalyticsPage() {
  const [chart, setChart] = useState<ChartRow[]>(DEFAULT_CHART);
  const [topProjects, setTopProjects] = useState<TopProject[]>(DEFAULT_TOP_PROJECTS);
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      analyticsApi.chart(days).catch(() => null),
      analyticsApi.topProjects().catch(() => null)
    ])
      .then(([c, p]) => {
        if (c && c.length > 0) setChart(c);
        if (p && p.length > 0) setTopProjects(p);
      })
      .catch(() => {
        setChart(DEFAULT_CHART);
        setTopProjects(DEFAULT_TOP_PROJECTS);
      })
      .finally(() => setLoading(false));
  }, [days]);

  const maxVisits = chart.length ? Math.max(...chart.map(r => r.total_visits), 1) : 1;
  const totalVisits = chart.reduce((s, r) => s + r.total_visits, 0);
  const totalUnique = chart.reduce((s, r) => s + r.unique_visitors, 0);
  const totalProjectViews = chart.reduce((s, r) => s + r.project_views, 0);

  return (
    <div style={{ padding: '40px', maxWidth: 1200 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Detailed visitor and project performance data.</p>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[7, 14, 30, 90].map(d => (
          <button
            key={d}
            id={`period-${d}`}
            onClick={() => setDays(d)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid',
              borderColor: days === d ? '#6366f1' : 'var(--border)',
              background: days === d ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: days === d ? '#a78bfa' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
            }}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: `Total Visits (${days}d)`, value: totalVisits, color: '#6366f1', icon: '📊' },
          { label: `Unique Visitors (${days}d)`, value: totalUnique, color: '#8b5cf6', icon: '✨' },
          { label: `Project Views (${days}d)`, value: totalProjectViews, color: '#10b981', icon: '🚀' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: s.color }}>{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Visitor Chart */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 28 }}>Daily Visitor Trend</h2>
        {loading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : chart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
            <p>No data for this period yet.</p>
          </div>
        ) : (
          <div>
            {/* Y labels + Bars */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 200, position: 'relative' }}>
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(pct => (
                <div key={pct} style={{
                  position: 'absolute',
                  left: 0, right: 0,
                  bottom: `${pct}%`,
                  borderBottom: '1px dashed rgba(99,102,241,0.1)',
                  pointerEvents: 'none'
                }} />
              ))}
              {chart.map((row, i) => {
                const h = Math.max((row.total_visits / maxVisits) * 180, 4);
                const pjH = Math.max((row.project_views / maxVisits) * 180, 2);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                      <div className="chart-bar" style={{ width: '45%', height: h }} title={`Visits: ${row.total_visits}`} />
                      <div style={{ width: '45%', height: pjH, background: 'linear-gradient(to top,#10b981,#34d399)', borderRadius: '4px 4px 0 0' }} title={`Project views: ${row.project_views}`} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(row.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />
                Total Visits
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: '#10b981' }} />
                Project Views
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Projects */}
      <div className="glass-card" style={{ padding: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Project Performance</h2>
        {topProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            No projects yet. Add projects to track performance.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {topProjects.map((p, i) => {
              const maxViews = Math.max(...topProjects.map(x => Number(x.views)), 1);
              const pct = (Number(p.views) / maxViews) * 100;
              return (
                <div key={p.id} style={{ padding: '16px 0', borderBottom: i < topProjects.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-muted)', width: 24 }}>#{i + 1}</span>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{p.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {[
                        { label: 'views', value: p.views, icon: '👁️' },
                        { label: 'demo', value: p.demo_views, icon: '▶️' },
                        { label: 'github', value: p.github_clicks, icon: '⬡' },
                        { label: 'live', value: p.live_clicks, icon: '🚀' },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.icon}</div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-card)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 2, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
