'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { analyticsApi } from '@/lib/api';
import type { AnalyticsOverview, ActivityEvent, ChartRow } from '@/lib/api';
import { DEFAULT_OVERVIEW, DEFAULT_ACTIVITY, DEFAULT_CHART } from '@/lib/fallbackData';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(DEFAULT_OVERVIEW);
  const [activity, setActivity] = useState<ActivityEvent[]>(DEFAULT_ACTIVITY);
  const [chart, setChart] = useState<ChartRow[]>(DEFAULT_CHART);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      analyticsApi.overview().catch(() => null),
      analyticsApi.activityFeed().catch(() => null),
      analyticsApi.chart(7).catch(() => null),
    ]).then(([o, a, c]) => {
      if (o) setOverview(o);
      if (Array.isArray(a)) setActivity(a);
      if (Array.isArray(c)) setChart(c);
    }).catch(() => {
      setOverview(DEFAULT_OVERVIEW);
      setActivity(DEFAULT_ACTIVITY);
      setChart(DEFAULT_CHART);
    }).finally(() => setLoading(false));
  }, []);

  const kpis = overview ? [
    { label: "Today's Visitors", value: overview.visitors_today, icon: '👤', color: '#6366f1', trend: '+' },
    { label: 'Total Visitors', value: overview.total_visitors, icon: '📊', color: '#8b5cf6', trend: '' },
    { label: 'Unique Visitors', value: overview.unique_visitors, icon: '✨', color: '#06b6d4', trend: '' },
    { label: 'Project Views', value: overview.total_project_views, icon: '🚀', color: '#10b981', trend: '' },
    { label: 'Total Leads', value: overview.total_leads, icon: '🤝', color: '#f59e0b', trend: '' },
    { label: 'This Week', value: overview.visitors_week, icon: '📅', color: '#a78bfa', trend: '' },
  ] : [];

  const maxVisits = chart.length ? Math.max(...chart.map(r => r.total_visits), 1) : 1;

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  function activityLabel(event: ActivityEvent) {
    const name = event.identified_name || `Anonymous (${event.city || 'Unknown'})`;
    const labels: Record<string, string> = {
      portfolio: `${name} visited your portfolio`,
      project: `${name} viewed ${event.project_title || 'a project'}`,
      demo_video: `${name} watched demo of ${event.project_title || 'a project'}`,
      github_click: `${name} clicked GitHub on ${event.project_title || 'a project'}`,
      live_demo_click: `${name} tried live demo of ${event.project_title || 'a project'}`,
      connect_click: `${name} clicked Connect`,
      resume_download: `${name} downloaded resume`,
    };
    return labels[event.page_type] || `${name}: ${event.page_type}`;
  }

  function activityIcon(type: string) {
    const icons: Record<string, string> = {
      portfolio: '👁️', project: '📁', demo_video: '▶️',
      github_click: '⬡', live_demo_click: '🚀',
      connect_click: '🤝', resume_download: '📄',
    };
    return icons[type] || '📌';
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 40, width: 300 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Welcome back, {user?.username} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Here&apos;s what&apos;s happening with your portfolio today.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="dashboard-grid" style={{ marginBottom: 32 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 60, opacity: 0.06 }}>{kpi.icon}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>{kpi.label}</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: kpi.color, letterSpacing: '-0.03em' }}>
              {kpi.value?.toLocaleString() || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginBottom: 32 }}>
        {/* Visitor chart */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Visitors — Last 7 days</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, padding: '0 8px' }}>
            {chart.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14, alignSelf: 'center', textAlign: 'center', width: '100%' }}>
                No data yet. Visitors will appear here.
              </div>
            ) : (
              chart.map((row, i) => {
                const h = Math.max((row.total_visits / maxVisits) * 140, 4);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.total_visits}</div>
                    <div
                      className="chart-bar"
                      style={{ width: '100%', height: h }}
                      title={`${row.date}: ${row.total_visits} visits`}
                    />
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(row.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/dashboard/analytics" style={{ textDecoration: 'none' }}>
              <div className="nav-item" style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>📈</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Full Analytics</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Charts & top projects</div>
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
              </div>
            </Link>
            <Link href="/dashboard/visitors" style={{ textDecoration: 'none' }}>
              <div className="nav-item" style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>👥</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Visitor Details</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Location & journeys</div>
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
              </div>
            </Link>
            <Link href="/dashboard/connections" style={{ textDecoration: 'none' }}>
              <div className="nav-item" style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>🤝</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Connection Inbox</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {overview && overview.total_leads > 0 && <span style={{ color: '#f59e0b', fontWeight: 700 }}>{overview.total_leads} total</span>} leads
                    </div>
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
              </div>
            </Link>
            <Link href="/dashboard/projects" style={{ textDecoration: 'none' }}>
              <div className="nav-item" style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border)', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>🚀</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Manage Projects</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Add / edit projects</div>
                  </div>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Activity</h2>
          <Link href="/dashboard/visitors" style={{ color: '#a78bfa', fontSize: 13, textDecoration: 'none' }}>View all →</Link>
        </div>

        {activity.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
            <p>No activity yet. Share your portfolio to start getting visitors!</p>
            <Link href={`/${user?.username}`} target="_blank" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ marginTop: 16, padding: '10px 20px', fontSize: 13 }}>
                View your portfolio →
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {activity.slice(0, 10).map((event, i) => (
              <div
                key={event.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0',
                  borderBottom: i < activity.length - 1 ? '1px solid var(--border)' : 'none'
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {activityIcon(event.page_type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activityLabel(event)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 12 }}>
                    {event.city && <span>📍 {event.city}, {event.country}</span>}
                    {event.device_type && <span>💻 {event.device_type}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {formatTime(event.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
