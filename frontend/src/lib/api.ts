const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

// Auth
export const authApi = {
  register: (data: { email: string; password: string; username: string; name: string }) =>
    apiFetch<{ access_token: string; username: string }>('/api/auth/register', {
      method: 'POST', body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    apiFetch<{ access_token: string; username: string }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify(data),
    }),
  me: () => apiFetch<{ id: string; email: string; username: string }>('/api/auth/me'),
};

// Profile
export const profileApi = {
  getMe: () => apiFetch<Profile>('/api/profile/me'),
  updateMe: (data: Partial<Profile>) =>
    apiFetch<Profile>('/api/profile/me', { method: 'PUT', body: JSON.stringify(data) }),
  getPublic: (username: string) => apiFetch<Profile>(`/api/profile/${username}`),
};

// Projects
export const projectsApi = {
  getMine: () => apiFetch<Project[]>('/api/projects/mine'),
  getPublic: (username: string) => apiFetch<Project[]>(`/api/projects/public/${username}`),
  create: (data: Partial<Project>) =>
    apiFetch<Project>('/api/projects/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Project>) =>
    apiFetch<Project>(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/api/projects/${id}`, { method: 'DELETE' }),
};

// Analytics
export const analyticsApi = {
  overview: () => apiFetch<AnalyticsOverview>('/api/analytics/overview'),
  chart: (days?: number) => apiFetch<ChartRow[]>(`/api/analytics/chart?days=${days || 14}`),
  topProjects: () => apiFetch<TopProject[]>('/api/analytics/top-projects'),
  recentVisitors: () => apiFetch<Visitor[]>('/api/analytics/recent-visitors'),
  activityFeed: () => apiFetch<ActivityEvent[]>('/api/analytics/activity-feed'),
};

// Connections
export const connectionsApi = {
  submit: (data: ConnectionSubmit) =>
    apiFetch('/api/connections/', { method: 'POST', body: JSON.stringify(data) }),
  list: (status?: string) =>
    apiFetch<Connection[]>(`/api/connections/${status ? `?status=${status}` : ''}`),
  updateStatus: (id: string, status: string) =>
    apiFetch(`/api/connections/${id}/status?status=${status}`, { method: 'PUT' }),
};

// Visitor tracking
export const trackingApi = {
  track: (data: TrackEvent) =>
    apiFetch('/api/visitors/track', { method: 'POST', body: JSON.stringify(data) }),
};

// AI Assistant (RAG)
export const aiApi = {
  ask: (data: { username: string; query: string; visitor_id?: string }) =>
    apiFetch<{
      answer: string;
      relevant_projects: Array<{
        id: string;
        title: string;
        description?: string;
        tech_stack?: string[];
        live_url?: string;
        github_url?: string;
      }>;
      suggested_followups: string[];
    }>('/api/ai/ask', { method: 'POST', body: JSON.stringify(data) }),
};

// Types
export interface Profile {
  id?: string;
  user_id?: string;
  username: string;
  name: string;
  title?: string;
  company?: string;
  experience_years?: number;
  bio?: string;
  avatar_url?: string;
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  website_url?: string;
  email_contact?: string;
  phone_contact?: string;
  email_visible?: boolean;
  phone_visible?: boolean;
  notify_on_visit?: boolean;
  notify_on_connect?: boolean;
  notify_email?: string;
  skills?: string[];
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  long_description?: string;
  tech_stack: string[];
  capabilities: string[];
  demo_video_url?: string;
  github_url?: string;
  live_url?: string;
  thumbnail_url?: string;
  is_featured?: boolean;
  order_index?: number;
  view_count?: number;
}

export interface AnalyticsOverview {
  total_visitors: number;
  unique_visitors: number;
  visitors_today: number;
  unique_today: number;
  project_views_today: number;
  demo_clicks_today: number;
  visitors_week: number;
  total_leads: number;
  total_project_views: number;
}

export interface ChartRow {
  date: string;
  total_visits: number;
  unique_visitors: number;
  project_views: number;
}

export interface TopProject {
  id: string;
  title: string;
  views: number;
  demo_views: number;
  github_clicks: number;
  live_clicks: number;
}

export interface Visitor {
  id: string;
  country: string;
  city: string;
  device_type?: string;
  browser?: string;
  identified_name?: string;
  identified_email?: string;
  visit_count: number;
  last_seen: string;
  first_seen: string;
  journey?: JourneyEvent[];
}

export interface JourneyEvent {
  page_type: string;
  project_id?: string;
  created_at: string;
}

export interface ActivityEvent {
  id: string;
  page_type: string;
  created_at: string;
  time_spent_seconds?: number;
  city?: string;
  country?: string;
  device_type?: string;
  identified_name?: string;
  project_title?: string;
}

export interface Connection {
  id: string;
  name: string;
  email: string;
  interest_type: string;
  message: string;
  status: string;
  created_at: string;
}

export interface ConnectionSubmit {
  profile_username: string;
  visitor_fingerprint: string;
  name: string;
  email: string;
  interest_type: string;
  message: string;
}

export interface TrackEvent {
  profile_username: string;
  visitor_fingerprint: string;
  page_type: string;
  project_id?: string;
  time_spent_seconds?: number;
  device_type?: string;
  browser?: string;
  os?: string;
  referrer?: string;
  metadata?: Record<string, unknown>;
}
