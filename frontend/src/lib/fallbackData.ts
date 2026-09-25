import { Profile, Project, AnalyticsOverview, ChartRow, TopProject, Visitor, ActivityEvent, Connection } from './api';

export const DEFAULT_CHIRU_PROFILE: Profile = {
  username: 'chiru',
  name: 'Chiranjeevi Kumar Battula',
  title: 'AI/ML Engineer | Generative AI | Agentic AI | Computer Vision | Edge AI',
  company: 'KPMG',
  experience_years: 3,
  bio: `AI/ML Engineer with 3+ years of experience building intelligent systems across Generative AI, Agentic AI, Deep Learning, Computer Vision, and Edge AI. Focused on transforming AI models into practical, scalable, production-oriented applications.\n\n"I build AI products, not just AI prototypes."`,
  linkedin_url: 'https://www.linkedin.com/in/chiranjeevikumar/',
  github_url: 'https://github.com/chiranjeevikumar',
  email_contact: 'chiranjeevi4205@gmail.com',
  email_visible: false,
  phone_visible: false,
  skills: [
    'Generative AI', 'Agentic AI', 'Deep Learning', 'Computer Vision', 'Edge AI',
    'LLMs', 'RAG', 'Prompt Engineering', 'Vector Search', 'AI Memory',
    'Tool Calling', 'LangChain', 'LangGraph', 'MCP', 'YOLO',
    'Video Analytics', 'NVIDIA Jetson Nano', 'Raspberry Pi', 'Model Optimization (INT8/FP16)',
    'Python', 'FastAPI', 'Docker', 'PostgreSQL'
  ],
};

export const DEFAULT_CHIRU_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Production AI Chatbot with Long-Term Memory & RAG',
    description: 'A production-oriented conversational AI system designed to maintain context, retrieve relevant information, and provide personalized responses across conversations.',
    long_description: 'Combines LLM reasoning, multi-session conversation history, semantic retrieval (RAG), and persistent memory layer. Addresses context loss in traditional chatbots by tracking conversational memory, document vectors, and providing ChatGPT-style streaming responses.',
    tech_stack: ['Python', 'FastAPI', 'LangChain', 'LangGraph', 'Vector DB', 'RAG', 'Embeddings', 'PostgreSQL', 'Docker', 'Streaming'],
    capabilities: [
      'Conversational AI', 'Multi-Session History', 'Long-Term Memory',
      'RAG Vector Retrieval', 'Context Management', 'ChatGPT-style Streaming', 'Guardrails'
    ],
    demo_video_url: 'https://drive.google.com/file/d/1jBRp8Fk57g53QlLJ_GFHjx0bpMuzmF6m/preview',
    github_url: 'https://github.com/chiranjeevikumar',
    live_url: 'https://chatbot-git-main-chiranjeevikumarbattula-4691.vercel.app/chat',
    order_index: 1,
    is_featured: true,
    view_count: 342,
  },
  {
    id: 'proj-2',
    title: 'AI Talking Avatar & End-to-End Video Generation',
    description: 'An end-to-end AI video generation pipeline that transforms a single facial image and user-provided text into a talking-avatar video with synthesized or cloned voice.',
    long_description: 'End-to-end AI pipeline transforming 1 face image + text + reference audio into a photo-realistic talking avatar video. Features voice cloning, audio-driven lip synchronization, face enhancement, and GPU-optimized rendering with FFmpeg.',
    tech_stack: ['Python', 'Deep Learning', 'Computer Vision', 'Voice Cloning', 'Lip Sync', 'FFmpeg', 'GPU Acceleration', 'FastAPI', 'Model Pipeline'],
    capabilities: [
      'Single-Image Animation', 'Voice Cloning', 'Audio-Driven Lip Sync',
      'Face Enhancement', 'Audio/Video Synchronization', 'GPU Pipeline Orchestration'
    ],
    demo_video_url: 'https://drive.google.com/file/d/1fYNGoZCNc0HASzLmBcSsLqpkNKtpVq62/preview',
    github_url: 'https://github.com/chiranjeevikumar',
    live_url: 'https://drive.google.com/file/d/1fYNGoZCNc0HASzLmBcSsLqpkNKtpVq62/view?usp=sharing',
    order_index: 2,
    is_featured: true,
    view_count: 284,
  },
  {
    id: 'proj-3',
    title: 'Real-Time Edge Computer Vision & Video Analytics',
    description: 'High-speed real-time object detection and person re-identification deployed on edge devices closer to where data is generated, reducing latency and bandwidth.',
    long_description: 'Real-time edge computer vision using YOLO and Person Re-ID deployed on NVIDIA Jetson Nano and Raspberry Pi. Leverages FP16 and INT8 model quantization and GPU inference acceleration to achieve low latency under constrained power envelopes.',
    tech_stack: ['Python', 'YOLO', 'OpenCV', 'NVIDIA Jetson Nano', 'Raspberry Pi', 'TensorRT', 'INT8/FP16 Optimization', 'Person Re-ID'],
    capabilities: [
      'Real-time Object Detection', 'Person Re-Identification',
      'INT8/FP16 Quantization', 'GPU Inference', 'Edge Deployment'
    ],
    demo_video_url: '',
    github_url: 'https://github.com/chiranjeevikumar',
    live_url: '',
    order_index: 3,
    is_featured: true,
    view_count: 156,
  },
];

export const DEFAULT_OVERVIEW: AnalyticsOverview = {
  total_visitors: 432,
  unique_visitors: 328,
  visitors_today: 18,
  unique_today: 14,
  project_views_today: 26,
  demo_clicks_today: 12,
  visitors_week: 114,
  total_leads: 7,
  total_project_views: 615,
};

export const DEFAULT_CHART: ChartRow[] = [
  { date: '2026-09-19', total_visits: 12, unique_visitors: 9, project_views: 18 },
  { date: '2026-09-20', total_visits: 15, unique_visitors: 11, project_views: 22 },
  { date: '2026-09-21', total_visits: 22, unique_visitors: 17, project_views: 31 },
  { date: '2026-09-22', total_visits: 19, unique_visitors: 14, project_views: 28 },
  { date: '2026-09-23', total_visits: 28, unique_visitors: 21, project_views: 42 },
  { date: '2026-09-24', total_visits: 24, unique_visitors: 18, project_views: 36 },
  { date: '2026-09-25', total_visits: 18, unique_visitors: 14, project_views: 26 },
];

export const DEFAULT_TOP_PROJECTS: TopProject[] = [
  {
    id: 'proj-1',
    title: 'Production AI Chatbot with Long-Term Memory & RAG',
    views: 342,
    demo_views: 94,
    github_clicks: 48,
    live_clicks: 39,
  },
  {
    id: 'proj-2',
    title: 'AI Talking Avatar & End-to-End Video Generation',
    views: 284,
    demo_views: 112,
    github_clicks: 31,
    live_clicks: 27,
  },
  {
    id: 'proj-3',
    title: 'Real-Time Edge Computer Vision & Video Analytics',
    views: 156,
    demo_views: 0,
    github_clicks: 22,
    live_clicks: 0,
  },
];

export const DEFAULT_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act-1',
    page_type: 'demo_video',
    project_title: 'Production AI Chatbot with Long-Term Memory & RAG',
    city: 'Bengaluru',
    country: 'India',
    device_type: 'desktop',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    identified_name: 'AI Engineering Lead',
  },
  {
    id: 'act-2',
    page_type: 'connect_click',
    city: 'Hyderabad',
    country: 'India',
    device_type: 'desktop',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    identified_name: 'Senior Technical Recruiter',
  },
  {
    id: 'act-3',
    page_type: 'project',
    project_title: 'AI Talking Avatar & End-to-End Video Generation',
    city: 'San Francisco',
    country: 'United States',
    device_type: 'desktop',
    created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    identified_name: 'GenAI Researcher',
  },
  {
    id: 'act-4',
    page_type: 'portfolio',
    city: 'London',
    country: 'United Kingdom',
    device_type: 'mobile',
    created_at: new Date(Date.now() - 1000 * 60 * 68).toISOString(),
  },
  {
    id: 'act-5',
    page_type: 'demo_video',
    project_title: 'AI Talking Avatar & End-to-End Video Generation',
    city: 'Bengaluru',
    country: 'India',
    device_type: 'desktop',
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
];

export const DEFAULT_VISITORS: Visitor[] = [
  {
    id: 'v-1',
    country: 'India',
    city: 'Bengaluru',
    device_type: 'desktop',
    browser: 'Chrome 128',
    identified_name: 'AI Engineering Lead @ Enterprise',
    identified_email: 'lead.ai@partner.com',
    visit_count: 4,
    last_seen: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    first_seen: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    journey: [
      { page_type: 'portfolio', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { page_type: 'project', project_id: 'proj-1', created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
      { page_type: 'demo_video', project_id: 'proj-1', created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
    ],
  },
  {
    id: 'v-2',
    country: 'India',
    city: 'Hyderabad',
    device_type: 'desktop',
    browser: 'Chrome 128',
    identified_name: 'Tech Recruiter',
    identified_email: 'recruiter@globalfirm.com',
    visit_count: 2,
    last_seen: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    first_seen: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    journey: [
      { page_type: 'portfolio', created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
      { page_type: 'connect_click', created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
    ],
  },
  {
    id: 'v-3',
    country: 'United States',
    city: 'San Francisco',
    device_type: 'desktop',
    browser: 'Safari 18',
    identified_name: 'GenAI Researcher',
    visit_count: 3,
    last_seen: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    first_seen: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    journey: [
      { page_type: 'portfolio', created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
      { page_type: 'project', project_id: 'proj-2', created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString() },
      { page_type: 'demo_video', project_id: 'proj-2', created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString() },
    ],
  },
  {
    id: 'v-4',
    country: 'United Kingdom',
    city: 'London',
    device_type: 'mobile',
    browser: 'Mobile Safari',
    visit_count: 1,
    last_seen: new Date(Date.now() - 1000 * 60 * 68).toISOString(),
    first_seen: new Date(Date.now() - 1000 * 60 * 68).toISOString(),
    journey: [
      { page_type: 'portfolio', created_at: new Date(Date.now() - 1000 * 60 * 68).toISOString() },
    ],
  },
];

export const DEFAULT_CONNECTIONS: Connection[] = [
  {
    id: 'c-1',
    name: 'Sarah Jenkins',
    email: 's.jenkins@cloud-ai-recruiting.com',
    interest_type: 'job_opportunity',
    message: 'Hi Chiranjeevi, loved your Production RAG Chatbot architecture and Edge CV work. We have a Staff AI/ML Engineer role at our team and would love to connect!',
    status: 'new',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'c-2',
    name: 'Vikram Mehta',
    email: 'vikram.mehta@fintech-ai.io',
    interest_type: 'consulting',
    message: 'Impression by the Talking Avatar video generation pipeline. Are you open for an advisory / consulting conversation regarding real-time lip synchronization models?',
    status: 'replied',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: 'c-3',
    name: 'Amitabh Sharma',
    email: 'amitabh.s@enterprise-tech.com',
    interest_type: 'collaboration',
    message: 'Great portfolio! Would like to discuss edge deployment on Jetson Nano and TensorRT optimization benchmarks.',
    status: 'contacted',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];
