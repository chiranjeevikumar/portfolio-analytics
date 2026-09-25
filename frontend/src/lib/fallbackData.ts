import { Profile, Project } from './api';

export const DEFAULT_CHIRU_PROFILE: Profile = {
  username: 'chiru',
  name: 'Chiranjeevi Kumar Battula',
  title: 'AI/ML Engineer | Generative AI | Agentic AI | Computer Vision | Edge AI',
  company: 'KPMG',
  experience_years: 3,
  bio: `AI/ML Engineer with 3+ years of experience building intelligent systems across Generative AI, Agentic AI, Deep Learning, Computer Vision, and Edge AI. Focused on transforming AI models into practical, scalable, production-oriented applications.\n\n"I build AI products, not just AI prototypes."`,
  linkedin_url: 'https://www.linkedin.com/in/chiranjeevikumar/',
  github_url: 'https://github.com/chiranjeevikumar',
  email_contact: 'chiranjeevikumarbattula@gmail.com',
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
  },
];
