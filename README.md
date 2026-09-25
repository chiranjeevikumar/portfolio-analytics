# PortfolioIQ — Personal Portfolio, Visitor Analytics & Lead Generation

A production-grade, full-stack personal portfolio, visitor intelligence, and lead generation application built for **Chiranjeevi Kumar Battula** (AI/ML Engineer at KPMG).

## 🚀 Features

- **Public Portfolio (`/[username]`)**:
  - High-impact dark mode aesthetic with glassmorphism and subtle gradients.
  - Interactive Project Showcases with embedded Google Drive demo videos and live application links:
    - *Production AI Chatbot with Long-Term Memory & RAG*
    - *AI Talking Avatar & End-to-End Video Generation*
    - *Real-Time Edge Computer Vision & Video Analytics (Jetson Nano / Raspberry Pi)*
  - Interactive Demo Walkthrough with cross-session memory simulation and talking avatar pipeline runner.
  - Core AI Expertise grid (Generative AI, Agentic AI, Computer Vision, Edge AI, AI Engineering).
  - 11-step visual product lifecycle (*How I Build AI Systems*).
  - **AI Portfolio Assistant (RAG)**: Conversational assistant answering visitor questions in natural language.
- **Lead Capture & Privacy Controls**:
  - Direct "Connect With Me" modal with interest categorization.
  - Privacy toggles for phone number and email visibility.
- **Owner Command Center (`/dashboard`)**:
  - Real-time visitor counts, page views, and conversion metrics.
  - 7-day visual activity chart.
  - Connections & Leads inbox with status management (`New`, `Contacted`, `Replied`).
  - Visitor Session Timeline showing visitor actions, device types, and geographic locations.
  - Full Project Management CRUD.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), Uvicorn, Psycopg2-binary (Connection Pooling)
- **Database**: Layerbase PostgreSQL
- **Visitor Intelligence**: ip-api.com geolocation + browser fingerprinting
- **Auth**: JWT + Bcrypt password hashing
- **Deployment**: Vercel (Frontend), Python ASGI (Backend)

## 📦 Project Structure

```text
portfolio_analytics/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # PostgreSQL connection pool with auto-reconnect
│   ├── auth.py              # JWT authentication & bcrypt hashing
│   ├── schema.sql           # Database schema (8 tables)
│   ├── routes/              # Modular API routes (auth, profile, projects, visitors, analytics, ai)
│   └── services/            # Geolocation & email notifications
└── frontend/
    ├── src/app/             # Next.js App Router pages
    │   ├── [username]/      # Public interactive portfolio
    │   ├── dashboard/       # Private owner analytics & inbox
    │   ├── login/           # Owner authentication
    │   └── register/        # Account registration
    └── src/lib/             # Typed API client & fingerprinting
```

## ⚡ Quick Start

### 1. Backend
```bash
cd backend
python -m venv env
# Windows: .\env\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000/chiru` to view the public portfolio, or `http://localhost:3000/login` for the owner dashboard.
