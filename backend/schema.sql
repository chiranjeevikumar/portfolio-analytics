-- =========================================
-- Portfolio Analytics - Full Database Schema
-- =========================================

-- Users table (ABC's login account)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (public-facing profile info)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    company VARCHAR(255),
    experience_years INTEGER,
    bio TEXT,
    avatar_url TEXT,
    resume_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    twitter_url TEXT,
    website_url TEXT,
    -- Contact visibility settings
    email_contact VARCHAR(255),
    phone_contact VARCHAR(50),
    email_visible BOOLEAN DEFAULT FALSE,
    phone_visible BOOLEAN DEFAULT FALSE,
    -- Notification settings
    notify_on_visit BOOLEAN DEFAULT TRUE,
    notify_on_connect BOOLEAN DEFAULT TRUE,
    notify_email VARCHAR(255),
    -- Skills (stored as JSON array)
    skills JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    long_description TEXT,
    tech_stack JSONB DEFAULT '[]',
    capabilities JSONB DEFAULT '[]',
    demo_video_url TEXT,
    github_url TEXT,
    live_url TEXT,
    thumbnail_url TEXT,
    is_featured BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitors table (one row per unique visitor fingerprint per profile)
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_username VARCHAR(50) NOT NULL,
    visitor_fingerprint VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    referrer TEXT,
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    visit_count INTEGER DEFAULT 1,
    -- After lead form submission
    identified_name VARCHAR(255),
    identified_email VARCHAR(255),
    UNIQUE(profile_username, visitor_fingerprint)
);

-- Page views table (every single page/project view event)
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
    profile_username VARCHAR(50) NOT NULL,
    page_type VARCHAR(50) NOT NULL, -- 'portfolio', 'project', 'demo_video', 'github_click', 'live_demo_click', 'connect_click', 'resume_download'
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    time_spent_seconds INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connections (lead generation form submissions)
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_username VARCHAR(50) NOT NULL,
    visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    interest_type VARCHAR(100) NOT NULL, -- 'job_opportunity', 'freelance', 'collaboration', 'discussion', 'other'
    message TEXT,
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'read', 'replied', 'archived'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'visit', 'connect', 'daily_summary'
    title VARCHAR(255) NOT NULL,
    body TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics aggregates (pre-computed daily stats for performance)
CREATE TABLE IF NOT EXISTS analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_username VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    total_visits INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    project_views INTEGER DEFAULT 0,
    demo_clicks INTEGER DEFAULT 0,
    github_clicks INTEGER DEFAULT 0,
    live_demo_clicks INTEGER DEFAULT 0,
    connect_clicks INTEGER DEFAULT 0,
    UNIQUE(profile_username, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_visitors_profile ON visitors(profile_username);
CREATE INDEX IF NOT EXISTS idx_visitors_fingerprint ON visitors(visitor_fingerprint);
CREATE INDEX IF NOT EXISTS idx_page_views_profile ON page_views(profile_username);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_project ON page_views(project_id);
CREATE INDEX IF NOT EXISTS idx_connections_profile ON connections(profile_username);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_profile ON analytics_daily(profile_username, date DESC);
