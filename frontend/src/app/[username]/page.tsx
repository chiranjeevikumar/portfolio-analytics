'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { profileApi, projectsApi, trackingApi, connectionsApi, aiApi } from '@/lib/api';
import type { Profile, Project } from '@/lib/api';
import { getVisitorFingerprint, getDeviceType, getBrowser, getOS } from '@/lib/fingerprint';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  projects?: Array<{
    id: string;
    title: string;
    description?: string;
    tech_stack?: string[];
    live_url?: string;
    github_url?: string;
  }>;
  followups?: string[];
}

export default function PublicPortfolioPage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnect, setShowConnect] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<{ title: string; url: string } | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'genai' | 'vision' | 'edge'>('all');
  const [activeDemo, setActiveDemo] = useState<'chatbot' | 'avatar'>('chatbot');
  const [chatbotStep, setChatbotStep] = useState(1);
  const [avatarStep, setAvatarStep] = useState(1);
  const [connectForm, setConnectForm] = useState({ name: '', email: '', interest_type: 'job_opportunity', message: '' });
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);
  const fingerprint = useRef('');
  const projectViewStart = useRef<Record<string, number>>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const CHATBOT_VIDEO_URL = "https://drive.google.com/file/d/1jBRp8Fk57g53QlLJ_GFHjx0bpMuzmF6m/preview";
  const AVATAR_VIDEO_URL = "https://drive.google.com/file/d/1fYNGoZCNc0HASzLmBcSsLqpkNKtpVq62/preview";
  const CHATBOT_LIVE_URL = "https://chatbot-git-main-chiranjeevikumarbattula-4691.vercel.app/chat";

  useEffect(() => {
    fingerprint.current = getVisitorFingerprint();

    // Track portfolio page visit
    trackingApi.track({
      profile_username: username,
      visitor_fingerprint: fingerprint.current,
      page_type: 'portfolio',
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      referrer: document.referrer,
    }).catch(() => {});

    // Load data
    Promise.all([
      profileApi.getPublic(username),
      projectsApi.getPublic(username),
    ]).then(([p, pr]) => {
      setProfile(p);
      setProjects(pr);
      const displayName = p.name || 'Chiranjeevi Kumar Battula';
      const firstName = displayName.split(' ')[0];
      setAiMessages([
        {
          role: 'assistant',
          text: `Hello! I am ${firstName}'s AI Assistant. Ask me anything about his work in Generative AI, production RAG architectures, Talking Avatar video pipelines, or Edge AI on Jetson & Raspberry Pi!`,
          followups: [
            `What is ${firstName}'s background and experience?`,
            `How does his Production AI Chatbot with RAG & Memory work?`,
            `Explain the AI Talking Avatar video generation pipeline.`,
            `What technologies does ${firstName} use at KPMG?`,
          ],
        },
      ]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [username]);

  function trackProjectView(projectId: string) {
    projectViewStart.current[projectId] = Date.now();
    trackingApi.track({
      profile_username: username,
      visitor_fingerprint: fingerprint.current,
      page_type: 'project',
      project_id: projectId,
    }).catch(() => {});
  }

  function trackClick(type: 'github_click' | 'live_demo_click' | 'demo_video' | 'connect_click' | 'resume_download', projectId?: string) {
    trackingApi.track({
      profile_username: username,
      visitor_fingerprint: fingerprint.current,
      page_type: type,
      project_id: projectId,
    }).catch(() => {});
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setConnectLoading(true);
    trackClick('connect_click');
    try {
      await connectionsApi.submit({
        profile_username: username,
        visitor_fingerprint: fingerprint.current,
        ...connectForm,
      });
      setConnectSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConnectLoading(false);
    }
  }

  async function handleAskAi(queryText?: string) {
    const q = (queryText || aiInput).trim();
    if (!q || aiLoading) return;
    setAiInput('');
    setAiLoading(true);

    const userMsg: ChatMessage = { role: 'user', text: q };
    setAiMessages(prev => [...prev, userMsg]);

    try {
      const resp = await aiApi.ask({
        username,
        query: q,
        visitor_id: fingerprint.current,
      });

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        text: resp.answer,
        projects: resp.relevant_projects,
        followups: resp.suggested_followups,
      };

      setAiMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setAiMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "I couldn't process that question right now. Feel free to use the 'Connect' form to send a direct message!",
          followups: ['How can I connect with Chiranjeevi?'],
        },
      ]);
    } finally {
      setAiLoading(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08081a' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading Chiranjeevi Kumar Battula&apos;s portfolio...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#08081a' }}>
        <div style={{ fontSize: 64 }}>🔍</div>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Portfolio not found</h1>
        <p style={{ color: 'var(--text-secondary)' }}>No portfolio exists at this URL.</p>
      </div>
    );
  }

  const name = profile.name || 'Chiranjeevi Kumar Battula';
  const roleTitle = profile.title || 'AI/ML Engineer | Generative AI | Agentic AI | Computer Vision | Edge AI';
  const company = profile.company || 'KPMG';
  const linkedinUrl = profile.linkedin_url || 'https://www.linkedin.com/in/chiranjeevikumar/';
  const githubUrl = profile.github_url || 'https://github.com/chiranjeevikumar';
  const emailContact = 'chiranjeevikumarbattula@gmail.com';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', overflowX: 'hidden' }}>
      {/* Background glow orbs */}
      <div className="orb" style={{ width: 800, height: 800, background: 'rgba(99,102,241,0.07)', top: -300, right: -250 }} />
      <div className="orb" style={{ width: 600, height: 600, background: 'rgba(139,92,246,0.05)', bottom: 300, left: -200 }} />

      {/* Top Navbar */}
      <nav style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,8,26,0.85)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>
            CK
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>{name}</div>
            <div style={{ fontSize: 11, color: '#a78bfa' }}>AI/ML Engineer • {company}</div>
          </div>
        </div>

        {/* Quick Anchor links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="hidden md:flex">
          <a href="#projects" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Projects</a>
          <a href="#expertise" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Expertise</a>
          <a href="#demos" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Architecture</a>
          <a href="#approach" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>How I Build</a>
          <a href="#tech-stack" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s' }}>Tech Stack</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            id="nav-ask-ai-btn"
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, borderColor: 'rgba(139, 92, 246, 0.4)', color: '#c4b5fd' }}
            onClick={() => setShowAiChat(true)}
          >
            <span>✨</span> Ask AI
          </button>
          <button
            id="connect-btn-nav"
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: 13 }}
            onClick={() => { setShowConnect(true); trackClick('connect_click'); }}
          >
            Connect With Me →
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '50px 24px 100px' }}>

        {/* 1. HERO SECTION */}
        <header style={{ marginBottom: 56, position: 'relative' }}>
          <div className="glass-card" style={{ padding: '52px 48px', position: 'relative', overflow: 'hidden' }}>
            {/* Top right decorative glow */}
            <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent)', pointerEvents: 'none' }} />

            {/* Positioning Banner */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', marginBottom: 20 }}>
              <span style={{ fontSize: 14 }}>🚀</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd', letterSpacing: '0.02em' }}>
                &ldquo;I build AI products, not just AI prototypes.&rdquo;
              </span>
            </div>

            <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 12 }}>
              {name}
            </h1>

            <p style={{ fontSize: 20, color: '#a78bfa', fontWeight: 600, marginBottom: 20, letterSpacing: '-0.01em' }}>
              {roleTitle}
            </p>

            <blockquote style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 780, marginBottom: 32, borderLeft: '3px solid #6366f1', paddingLeft: 16 }}>
              AI/ML Engineer with <strong>3+ years of experience</strong> building intelligent systems across <strong>Generative AI, Agentic AI, Deep Learning, Computer Vision, and Edge AI</strong>. Focused on transforming AI models into practical, scalable, production-oriented applications.
            </blockquote>

            {/* Prominent Action Buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="#projects" style={{ textDecoration: 'none' }}>
                <button id="hero-view-projects-btn" className="btn-primary" style={{ padding: '14px 28px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⚡ View Production Projects
                </button>
              </a>

              <a href="#demos" style={{ textDecoration: 'none' }}>
                <button id="hero-watch-demos-btn" className="btn-secondary" style={{ padding: '14px 24px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ▶ Watch Project Demos
                </button>
              </a>

              <button
                id="connect-btn-main"
                className="btn-secondary"
                style={{ padding: '14px 24px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, borderColor: 'rgba(99, 102, 241, 0.4)' }}
                onClick={() => { setShowConnect(true); trackClick('connect_click'); }}
              >
                🤝 Connect With Me
              </button>

              <a href={githubUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} onClick={() => trackClick('github_click')}>
                <button className="btn-secondary" style={{ padding: '14px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
                  GitHub
                </button>
              </a>

              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button className="btn-secondary" style={{ padding: '14px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" fill="#0077B5" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                  LinkedIn
                </button>
              </a>
            </div>
          </div>
        </header>

        {/* 2. PROFESSIONAL SNAPSHOT */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: '3+ Years', sub: 'AI/ML Experience', icon: '⏱️', meta: 'Production Systems • KPMG' },
              { label: 'Generative AI', sub: 'LLMs, RAG, AI Agents', icon: '🧠', meta: 'LangChain • LangGraph' },
              { label: 'Computer Vision', sub: 'Detection, Re-ID, Video AI', icon: '👁️', meta: 'YOLO • OpenCV' },
              { label: 'Edge AI', sub: 'Raspberry Pi, Jetson Nano', icon: '⚡', meta: 'FP16 / INT8 TensorRT' },
              { label: 'Production AI', sub: 'Full App Lifecycle', icon: '🏗️', meta: 'FastAPI • Docker • APIs' },
            ].map((s, idx) => (
              <div key={idx} className="stat-card" style={{ padding: 24 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#f0f0ff', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600, marginBottom: 6 }}>{s.sub}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.meta}</div>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: '24px 32px', background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, fontStyle: 'italic' }}>
              &ldquo;My work spans the complete AI application lifecycle — from understanding a business problem and selecting the right model or architecture to developing APIs, integrating AI components, managing data and memory, optimizing inference, and delivering usable end-to-end applications.&rdquo;
            </p>
          </div>
        </section>

        {/* 3. CORE AI EXPERTISE */}
        <section id="expertise" style={{ marginBottom: 64 }}>
          <div style={{ marginBottom: 28 }}>
            <div className="badge" style={{ marginBottom: 8 }}>Core Capabilities</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>Technical Expertise & Specializations</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Production-grade techniques applied across real enterprise environments</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              {
                title: 'Generative AI',
                icon: '🤖',
                skills: ['Large Language Models', 'Prompt Engineering', 'Retrieval-Augmented Generation (RAG)', 'Conversational AI', 'Embeddings', 'Vector Search', 'AI Memory', 'LLM Application Development']
              },
              {
                title: 'Agentic AI',
                icon: '🧩',
                skills: ['AI Agents', 'Tool Calling', 'Agent Workflows', 'Multi-step Reasoning', 'Agent Orchestration', 'LangChain', 'LangGraph', 'MCP / Model Context Protocol', 'Tool Integration', 'Guardrails']
              },
              {
                title: 'Computer Vision',
                icon: '👁️',
                skills: ['Object Detection', 'YOLO', 'Person Re-Identification', 'Image Classification', 'Video Analytics', 'Real-time Computer Vision', 'Deep Learning']
              },
              {
                title: 'Edge AI & Optimization',
                icon: '⚡',
                skills: ['NVIDIA Jetson Nano', 'Raspberry Pi', 'Model Optimization', 'GPU Inference', 'INT8 / FP16 Optimization', 'Real-time Inference', 'Edge Deployment']
              },
              {
                title: 'AI Application Engineering',
                icon: '🛠️',
                skills: ['Python', 'FastAPI', 'REST APIs', 'Docker', 'Vector Databases', 'Database Integration', 'Frontend/API Integration', 'Production Deployment']
              }
            ].map((exp, idx) => (
              <div key={idx} className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>{exp.icon}</span>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{exp.title}</h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {exp.skills.map(s => (
                    <span key={s} className="tech-pill" style={{ fontSize: 12, padding: '4px 10px' }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FEATURED PRODUCTION PROJECTS */}
        <section id="projects" style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div className="badge" style={{ marginBottom: 8 }}>Portfolio Highlights</div>
              <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>Featured Production Projects</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Real, production-oriented AI systems engineered for scale and user impact</p>
            </div>
          </div>

          {/* PROJECT 1 SHOWCASE */}
          <div className="glass-card" style={{ padding: 36, marginBottom: 36, border: '1px solid rgba(99, 102, 241, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
              <div>
                <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#a78bfa', borderColor: 'rgba(99,102,241,0.4)', marginBottom: 8, display: 'inline-block' }}>
                  Project 1 • Flagship Conversational System
                </span>
                <h3 style={{ fontSize: 26, fontWeight: 800 }}>Production AI Chatbot with Long-Term Memory & RAG</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => {
                    setActiveVideoModal({ title: 'Production AI Chatbot with Long-Term Memory & RAG', url: CHATBOT_VIDEO_URL });
                    trackClick('demo_video', 'chatbot');
                  }}
                >
                  ▶ Watch Demo
                </button>
                <a href={CHATBOT_LIVE_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} onClick={() => trackClick('live_demo_click', 'chatbot')}>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, borderColor: 'rgba(99, 102, 241, 0.4)', color: '#c4b5fd' }}>
                    🚀 Try Live App ↗
                  </button>
                </a>
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} onClick={() => trackClick('github_click', 'chatbot')}>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12 }}>
                    Code ↗
                  </button>
                </a>
              </div>
            </div>

            <p style={{ fontSize: 16, color: '#c4b5fd', fontWeight: 500, marginBottom: 24, fontStyle: 'italic' }}>
              &ldquo;A production-oriented conversational AI system designed to maintain context, retrieve relevant information, and provide personalized responses across conversations.&rdquo;
            </p>

            {/* Problem & Solution Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
              <div style={{ padding: 20, borderRadius: 12, background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fda4af', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⚠️</span> The Problem
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Traditional chatbots treat conversations as isolated silos. They lose vital context when a user starts a new session, when history grows large, or when document knowledge needs to be queried accurately without hallucinations.
                </p>
              </div>

              <div style={{ padding: 20, borderRadius: 12, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#6ee7b7', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>💡</span> The Production Solution
                </h4>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  An architecture combining <strong>LLM reasoning, persistent vector retrieval (RAG), and a separate memory layer</strong> that extracts and indexes user facts and conversation context, serving responses via low-latency streaming.
                </p>
              </div>
            </div>

            {/* Visual Architecture Diagram */}
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
                System Architecture Flow
              </h4>
              <div style={{ padding: 20, borderRadius: 12, background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border)', overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 700, justifyContent: 'space-between' }}>
                  {['User', 'Chat Interface', 'Backend API', 'Conversation Manager', 'Memory Layer', 'Retriever / RAG', 'LLM', 'Streaming Response'].map((step, idx, arr) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', fontSize: 12, fontWeight: 600, color: '#e0e7ff', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {step}
                      </div>
                      {idx < arr.length - 1 && <span style={{ color: '#6366f1', fontWeight: 800 }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Capabilities & Tech Stack */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Core Capabilities
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Conversational AI', 'Conversation History', 'Memory Management', 'RAG Retrieval', 'Context Management', 'Streaming Responses', 'Guardrails', 'Session Persistence'].map(c => (
                    <span key={c} className="tech-pill" style={{ background: 'rgba(139, 92, 246, 0.12)', borderColor: 'rgba(139, 92, 246, 0.3)' }}>{c}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Technologies & Concepts
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['Python', 'FastAPI', 'LangChain', 'LangGraph', 'Vector DB', 'Embeddings', 'PostgreSQL', 'Docker', 'SSE Streaming'].map(t => (
                    <span key={t} className="tech-pill">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Production Considerations */}
            <div style={{ padding: 18, borderRadius: 10, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd', marginBottom: 6 }}>
                Production Engineering Highlights
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Optimized context token windows to avoid latency bloat • Multi-tenant session state stored in PostgreSQL • Asynchronous memory extraction workers preventing chat latency degradation • Guardrails enforcing data privacy.
              </p>
            </div>
          </div>

          {/* PROJECT 2 SHOWCASE */}
          <div className="glass-card" style={{ padding: 36, marginBottom: 36, border: '1px solid rgba(139, 92, 246, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
              <div>
                <span className="badge" style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', borderColor: 'rgba(139,92,246,0.4)', marginBottom: 8, display: 'inline-block' }}>
                  Project 2 • AI Video & Audio Generation Pipeline
                </span>
                <h3 style={{ fontSize: 26, fontWeight: 800 }}>AI Talking Avatar & End-to-End Video Generation</h3>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={() => {
                    setActiveVideoModal({ title: 'AI Talking Avatar & End-to-End Video Generation', url: AVATAR_VIDEO_URL });
                    trackClick('demo_video', 'avatar');
                  }}
                >
                  ▶ Watch Demo Video
                </button>
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} onClick={() => trackClick('github_click', 'avatar')}>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12 }}>
                    Code ↗
                  </button>
                </a>
              </div>
            </div>

            <p style={{ fontSize: 16, color: '#c4b5fd', fontWeight: 500, marginBottom: 24, fontStyle: 'italic' }}>
              &ldquo;An end-to-end AI video generation pipeline that transforms a single facial image and user-provided text into a talking-avatar video with synthesized or cloned voice.&rdquo;
            </p>

            {/* Inputs & Challenges Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
              <div style={{ padding: 20, borderRadius: 12, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#a5b4fc', marginBottom: 8 }}>
                  📥 The 3 Core Inputs
                </h4>
                <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: 18 }}>
                  <li><strong>1. Single Face Image:</strong> Reference portrait</li>
                  <li><strong>2. Text Prompt:</strong> Desired script for the avatar</li>
                  <li><strong>3. Reference Audio:</strong> Voice cloning sample</li>
                </ul>
              </div>

              <div style={{ padding: 20, borderRadius: 12, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fcd34d', marginBottom: 8 }}>
                  ⚙️ Key Engineering Challenges
                </h4>
                <ul style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: 18 }}>
                  <li><strong>Lip Synchronization:</strong> Precise audio-phoneme to mouth shape mapping</li>
                  <li><strong>Voice Similarity:</strong> Maintaining speaker acoustic identity</li>
                  <li><strong>Facial Quality:</strong> Eliminating distortion & maintaining natural eye blink</li>
                  <li><strong>GPU Efficiency:</strong> VRAM management & FFmpeg rendering pipeline</li>
                </ul>
              </div>
            </div>

            {/* End to End Pipeline Visual */}
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
                End-to-End Pipeline
              </h4>
              <div style={{ padding: 20, borderRadius: 12, background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border)', overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 850, justifyContent: 'space-between' }}>
                  {['User Image', 'Face Processing', 'Text Input', 'Voice Cloning', 'Speech Audio', 'Talking Avatar Model', 'Lip Sync', 'Face Enhancement', 'Video Rendering', 'Final AI Video'].map((step, idx, arr) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', fontSize: 11, fontWeight: 600, color: '#f3e8ff', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {step}
                      </div>
                      {idx < arr.length - 1 && <span style={{ color: '#8b5cf6', fontWeight: 800 }}>→</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>
                Technologies & Tools
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['Python', 'Deep Learning', 'Computer Vision', 'Voice Cloning', 'Lip Synchronization', 'FFmpeg', 'GPU Acceleration (CUDA)', 'Model Pipeline', 'FastAPI'].map(t => (
                  <span key={t} className="tech-pill">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* PROJECT 3: EDGE AI & COMPUTER VISION */}
          <div className="glass-card" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
              <div>
                <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.4)', marginBottom: 8, display: 'inline-block' }}>
                  Project 3 • Edge AI & Computer Vision
                </span>
                <h3 style={{ fontSize: 24, fontWeight: 800 }}>Real-Time Edge Computer Vision & Video Analytics</h3>
              </div>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} onClick={() => trackClick('github_click', 'edge')}>
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12 }}>
                  Code ↗
                </button>
              </a>
            </div>

            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>
              High-speed real-time object detection and person re-identification deployed directly on edge devices closer to where data is generated, reducing bandwidth and transmission latency.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {['YOLO', 'OpenCV', 'NVIDIA Jetson Nano', 'Raspberry Pi', 'TensorRT', 'INT8 / FP16 Quantization', 'Person Re-ID', 'Python'].map(t => (
                <span key={t} className="tech-pill">{t}</span>
              ))}
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Focused on deploying computer vision models on constrained hardware with model pruning and INT8 precision optimization.
            </div>
          </div>
        </section>

        {/* 5. INTERACTIVE DEMO WALKTHROUGH */}
        <section id="demos" style={{ marginBottom: 64 }}>
          <div className="glass-card" style={{ padding: 36, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="badge" style={{ marginBottom: 6 }}>Interactive Demo Walkthrough</div>
                <h3 style={{ fontSize: 24, fontWeight: 800 }}>See How the Systems Work in Practice</h3>
              </div>

              {/* Tabs for demo */}
              <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.3)', padding: 4, borderRadius: 10 }}>
                <button
                  onClick={() => setActiveDemo('chatbot')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: activeDemo === 'chatbot' ? '#6366f1' : 'transparent',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  AI Chatbot with Memory
                </button>
                <button
                  onClick={() => setActiveDemo('avatar')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: activeDemo === 'avatar' ? '#8b5cf6' : 'transparent',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  Talking Avatar Pipeline
                </button>
              </div>
            </div>

            {activeDemo === 'chatbot' ? (
              <div>
                {/* Embedded Video Player */}
                <div style={{ marginBottom: 28, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(99, 102, 241, 0.35)', background: '#000', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
                  <div style={{ padding: '12px 18px', background: 'rgba(99, 102, 241, 0.1)', borderBottom: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>🎥</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e7ff' }}>Demo Video: Production AI Chatbot with Long-Term Memory & RAG</div>
                        <div style={{ fontSize: 11, color: '#a78bfa' }}>End-to-end multi-session retrieval, context retention, and streaming demo</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={CHATBOT_LIVE_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }} onClick={() => trackClick('live_demo_click', 'chatbot')}>
                        <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12, borderColor: '#6366f1', color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: 4 }}>
                          🚀 Open Live App ↗
                        </button>
                      </a>
                      <a href="https://drive.google.com/file/d/1jBRp8Fk57g53QlLJ_GFHjx0bpMuzmF6m/view?usp=drive_link" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                          Full Screen ↗
                        </button>
                      </a>
                    </div>
                  </div>
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
                    <iframe
                      src={CHATBOT_VIDEO_URL}
                      title="Production AI Chatbot Demo Video"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                  Follow the multi-turn context retention flow across sessions:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
                  {[
                    { step: 1, title: 'New Conversation', desc: 'User starts new session and establishes personal context' },
                    { step: 2, title: 'Memory Extraction', desc: 'System automatically parses and indexes user facts in vector DB' },
                    { step: 3, title: 'Session Switch', desc: 'User opens another conversation days later' },
                    { step: 4, title: 'Cross-Session Recall', desc: 'Chatbot retrieves earlier context and answers accurately' },
                  ].map(s => (
                    <div
                      key={s.step}
                      onClick={() => setChatbotStep(s.step)}
                      style={{
                        padding: 16,
                        borderRadius: 10,
                        border: '1px solid',
                        borderColor: chatbotStep === s.step ? '#6366f1' : 'var(--border)',
                        background: chatbotStep === s.step ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', marginBottom: 4 }}>STEP {s.step}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: 20, borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e0e7ff' }}>Live Simulation Output:</span>
                  </div>
                  {chatbotStep === 1 && (
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <strong style={{ color: '#818cf8' }}>User:</strong> &ldquo;I am leading an enterprise migration to FastAPI microservices on AWS.&rdquo;<br/>
                      <strong style={{ color: '#a78bfa' }}>AI:</strong> &ldquo;Understood! I will keep your FastAPI microservices stack on AWS in mind for all recommendations.&rdquo;
                    </div>
                  )}
                  {chatbotStep === 2 && (
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <strong style={{ color: '#10b981' }}>Memory Agent:</strong> Extracted entity: <code>{`{ user_stack: "FastAPI", cloud: "AWS", role: "lead" }`}</code> → Indexed into Vector Memory.
                    </div>
                  )}
                  {chatbotStep === 3 && (
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <strong style={{ color: '#818cf8' }}>User (Session #2 - 3 days later):</strong> &ldquo;What logging framework should we integrate?&rdquo;
                    </div>
                  )}
                  {chatbotStep === 4 && (
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      <strong style={{ color: '#a78bfa' }}>AI (Retrieved Memory):</strong> &ldquo;For your FastAPI microservices setup on AWS, I recommend <code>structlog</code> paired with AWS CloudWatch JSON formatters for optimal distributed tracing.&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {/* Embedded Video Player */}
                <div style={{ marginBottom: 28, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.35)', background: '#000', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
                  <div style={{ padding: '12px 18px', background: 'rgba(139, 92, 246, 0.1)', borderBottom: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>🎬</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f3e8ff' }}>Demo Video: AI Talking Avatar & Video Generation Pipeline</div>
                        <div style={{ fontSize: 11, color: '#c4b5fd' }}>Single image + voice cloning + audio-driven lip synchronization</div>
                      </div>
                    </div>
                    <a href="https://drive.google.com/file/d/1fYNGoZCNc0HASzLmBcSsLqpkNKtpVq62/view?usp=sharing" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: 12, borderColor: '#8b5cf6', color: '#c4b5fd' }}>
                        Full Screen ↗
                      </button>
                    </a>
                  </div>
                  <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
                    <iframe
                      src={AVATAR_VIDEO_URL}
                      title="AI Talking Avatar Demo Video"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
                  From a single portrait photo to an audio-synced video:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
                  {[
                    { step: 1, title: '1. Input Ingestion', desc: '1 Face Image + Text Script + Reference Speaker Audio' },
                    { step: 2, title: '2. Voice Cloning', desc: 'Acoustic synthesis generates synchronized WAV audio' },
                    { step: 3, title: '3. Talking Avatar Model', desc: 'Audio-driven phoneme mapping animates facial landmarks' },
                    { step: 4, title: '4. Face Enhancement', desc: 'Resolution upscaling and FFmpeg final video rendering' },
                  ].map(s => (
                    <div
                      key={s.step}
                      onClick={() => setAvatarStep(s.step)}
                      style={{
                        padding: 16,
                        borderRadius: 10,
                        border: '1px solid',
                        borderColor: avatarStep === s.step ? '#8b5cf6' : 'var(--border)',
                        background: avatarStep === s.step ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#c4b5fd', marginBottom: 4 }}>STAGE {s.step}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: 20, borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e0e7ff' }}>Stage Execution Pipeline:</span>
                  </div>
                  {avatarStep === 1 && (
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                      Ingesting <code>portrait.jpg</code> (1024x1024) + Prompt text: &ldquo;Hello, welcome to my AI engineering portfolio.&rdquo;
                    </div>
                  )}
                  {avatarStep === 2 && (
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                      Synthesizing voice matching reference timbre → Generating 24kHz raw PCM / WAV stream with natural cadence.
                    </div>
                  )}
                  {avatarStep === 3 && (
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                      Applying audio-driven facial keypoint deformation; calculating lip mesh coordinates at 30 FPS.
                    </div>
                  )}
                  {avatarStep === 4 && (
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                      Executing GFPGAN/CodeFormer facial enhancement pass → Muxing audio/video via FFmpeg with H.264 encoding.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 6. AI ENGINEERING APPROACH */}
        <section id="approach" style={{ marginBottom: 64 }}>
          <div style={{ marginBottom: 28 }}>
            <div className="badge" style={{ marginBottom: 8 }}>Methodology</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>How I Build AI Systems</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>A disciplined, product-centric engineering lifecycle</p>
          </div>

          <div className="glass-card" style={{ padding: 36 }}>
            {/* Visual Lifecycle Pipeline */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 28 }}>
              {[
                { num: '01', title: 'Problem', desc: 'Identify core bottleneck' },
                { num: '02', title: 'AI Architecture', desc: 'System blueprints' },
                { num: '03', title: 'Model Selection', desc: 'Accuracy vs cost' },
                { num: '04', title: 'Data/Knowledge', desc: 'RAG & Vector index' },
                { num: '05', title: 'AI Pipeline', desc: 'Chains & Agents' },
                { num: '06', title: 'API Dev', desc: 'FastAPI REST/SSE' },
                { num: '07', title: 'Integration', desc: 'UI & App components' },
                { num: '08', title: 'Testing', desc: 'Eval & Guardrails' },
                { num: '09', title: 'Optimization', desc: 'Quantization/latency' },
                { num: '10', title: 'Deployment', desc: 'Docker & Cloud' },
                { num: '11', title: 'Monitoring', desc: 'Telemetry & logs' },
              ].map(s => (
                <div key={s.num} style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#818cf8', marginBottom: 2 }}>{s.num}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              ))}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, fontStyle: 'italic', borderLeft: '3px solid #8b5cf6', paddingLeft: 16 }}>
              &ldquo;I focus on building AI systems as complete products — combining models, data, APIs, infrastructure, user experience, and deployment rather than treating the model as the entire solution.&rdquo;
            </p>
          </div>
        </section>

        {/* 7. TECHNOLOGY STACK */}
        <section id="tech-stack" style={{ marginBottom: 64 }}>
          <div style={{ marginBottom: 28 }}>
            <div className="badge" style={{ marginBottom: 8 }}>Technologies</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>Production Technology Stack</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Verified hands-on technologies backed by real production work</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {[
              { category: 'Languages', items: ['Python'] },
              { category: 'Generative AI', items: ['LLMs', 'RAG', 'Embeddings', 'Prompt Engineering', 'AI Agents'] },
              { category: 'Frameworks', items: ['LangChain', 'LangGraph', 'FastAPI'] },
              { category: 'Computer Vision', items: ['YOLO', 'OpenCV', 'Deep Learning'] },
              { category: 'Edge AI', items: ['NVIDIA Jetson Nano', 'Raspberry Pi'] },
              { category: 'Infrastructure', items: ['Docker', 'REST APIs', 'GPU Inference'] },
              { category: 'Databases & AI Storage', items: ['SQL / PostgreSQL', 'Vector Databases', 'Embeddings Storage'] },
            ].map(group => (
              <div key={group.category} className="glass-card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  {group.category}
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {group.items.map(item => (
                    <span key={item} className="tech-pill" style={{ fontSize: 12 }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. CONTACT / CONNECT SECTION */}
        <section id="contact" style={{ marginBottom: 64 }}>
          <div className="glass-card" style={{ padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent)', pointerEvents: 'none' }} />

            <div style={{ fontSize: 40, marginBottom: 16 }}>🤝</div>
            <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Let&apos;s Build Something With AI
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, maxWidth: 620, margin: '0 auto 32px' }}>
              Interested in Generative AI, Agentic AI, Computer Vision, Edge AI, or building production-oriented AI applications? Let&apos;s connect.
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                id="contact-connect-btn"
                className="btn-primary"
                style={{ padding: '14px 32px', fontSize: 15 }}
                onClick={() => { setShowConnect(true); trackClick('connect_click'); }}
              >
                Connect With Me →
              </button>

              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button className="btn-secondary" style={{ padding: '14px 24px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" fill="#0077B5" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                  LinkedIn
                </button>
              </a>

              <a href={`mailto:${emailContact}`} style={{ textDecoration: 'none' }}>
                <button className="btn-secondary" style={{ padding: '14px 24px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ✉️ Email Me
                </button>
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* Floating AI Button */}
      <button
        id="ask-ai-floating-btn"
        onClick={() => setShowAiChat(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 40,
          padding: '12px 22px',
          borderRadius: 50,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.45)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          fontSize: 14,
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ fontSize: 16 }}>✨</span> Ask AI about Chiranjeevi
      </button>

      {/* AI Assistant Modal */}
      {showAiChat && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAiChat(false);
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: 640,
              height: '82vh',
              maxHeight: 720,
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}
                >
                  🤖
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Chiranjeevi&apos;s AI Assistant</h3>
                  <p style={{ fontSize: 12, color: '#a78bfa' }}>PortfolioIQ RAG • Verified Context</p>
                </div>
              </div>
              <button
                id="close-ai-chat"
                onClick={() => setShowAiChat(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 20,
                  padding: 8,
                }}
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '12px 18px',
                      borderRadius: 16,
                      fontSize: 14,
                      lineHeight: 1.6,
                      background: msg.role === 'user' ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                      borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                      borderTopLeftRadius: msg.role === 'assistant' ? 4 : 16,
                    }}
                  >
                    {msg.text}
                  </div>

                  {/* Project Cards if returned */}
                  {msg.projects && msg.projects.length > 0 && (
                    <div style={{ marginTop: 10, width: '100%', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {msg.projects.map((proj) => (
                        <div
                          key={proj.id}
                          style={{
                            padding: '10px 14px',
                            background: 'rgba(99, 102, 241, 0.08)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            borderRadius: 10,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{proj.title}</div>
                            {proj.description && (
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {proj.description}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {proj.live_url && (
                              <a href={proj.live_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>Demo ↗</button>
                              </a>
                            )}
                            {proj.github_url && (
                              <a href={proj.github_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>Code ↗</button>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggested follow-up chips */}
                  {msg.followups && msg.followups.length > 0 && i === aiMessages.length - 1 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                      {msg.followups.map((f, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAskAi(f)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 20,
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            background: 'rgba(139, 92, 246, 0.07)',
                            color: '#c4b5fd',
                            fontSize: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {f} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {aiLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
                  Thinking...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Connect Bridge & Input */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.01)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Want to collaborate or discuss an AI project?</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAiChat(false);
                    setShowConnect(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#818cf8',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Send direct message →
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskAi();
                }}
                style={{ display: 'flex', gap: 10 }}
              >
                <input
                  id="ai-chat-input"
                  className="input-field"
                  type="text"
                  placeholder="Ask anything about Chiranjeevi's projects..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  disabled={aiLoading}
                  style={{ flex: 1, padding: '12px 16px', fontSize: 14 }}
                />
                <button
                  id="ai-chat-submit"
                  className="btn-primary"
                  type="submit"
                  disabled={aiLoading || !aiInput.trim()}
                  style={{ padding: '0 20px', fontSize: 14 }}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {showConnect && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConnect(false);
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: 520,
              padding: 36,
              position: 'relative',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            <button
              id="close-connect-modal"
              onClick={() => setShowConnect(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 20,
              }}
            >
              ✕
            </button>

            {connectSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                  Thank you for reaching out! Chiranjeevi has been notified and will get back to you soon.
                </p>
                <button className="btn-primary" onClick={() => { setShowConnect(false); setConnectSuccess(false); }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="badge" style={{ marginBottom: 8 }}>Connect</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                  Connect with Chiranjeevi
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                  Submit your message or collaboration inquiry directly.
                </p>

                <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>I&apos;m interested in</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { value: 'job_opportunity', label: '💼 Job Opportunity' },
                        { value: 'freelance', label: '🚀 Freelance Project' },
                        { value: 'collaboration', label: '🤝 Collaboration' },
                        { value: 'discussion', label: '💬 AI/ML Discussion' },
                        { value: 'other', label: '✨ Other' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          id={`interest-${opt.value}`}
                          style={{
                            padding: '10px', borderRadius: 8, border: '1px solid',
                            borderColor: connectForm.interest_type === opt.value ? '#6366f1' : 'var(--border)',
                            background: connectForm.interest_type === opt.value ? 'rgba(99,102,241,0.1)' : 'transparent',
                            color: connectForm.interest_type === opt.value ? '#a78bfa' : 'var(--text-secondary)',
                            cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
                          }}
                          onClick={() => setConnectForm(f => ({ ...f, interest_type: opt.value }))}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Name</label>
                    <input id="connect-name" className="input-field" type="text" placeholder="John Doe" required
                      value={connectForm.name} onChange={e => setConnectForm(f => ({ ...f, name: e.target.value }))} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Email</label>
                    <input id="connect-email" className="input-field" type="email" placeholder="john@example.com" required
                      value={connectForm.email} onChange={e => setConnectForm(f => ({ ...f, email: e.target.value }))} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message</label>
                    <textarea
                      id="connect-message"
                      className="input-field"
                      placeholder="I'd like to discuss an AI project..."
                      required
                      rows={4}
                      style={{ resize: 'vertical', minHeight: 90 }}
                      value={connectForm.message}
                      onChange={e => setConnectForm(f => ({ ...f, message: e.target.value }))}
                    />
                  </div>

                  <button id="connect-submit" className="btn-primary" type="submit" disabled={connectLoading} style={{ padding: '14px', fontSize: 15, width: '100%' }}>
                    {connectLoading ? 'Sending...' : 'Send Message →'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Video Lightbox Modal */}
      {activeVideoModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveVideoModal(null);
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: 860,
              padding: 0,
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🎥</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f0ff' }}>{activeVideoModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, padding: 4 }}
              >
                ✕
              </button>
            </div>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
              <iframe
                src={activeVideoModal.url}
                title={activeVideoModal.title}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
