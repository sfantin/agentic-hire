# AgenticHire

AI-powered job qualification SaaS. Automatically discovers, evaluates, and generates outreach for job opportunities using an LLM-as-a-judge architecture.

**Strategic Advantage:** Searches LinkedIn **Posts** (not the Jobs tab) using customizable boolean queries — uncovering recent postings with less competition and visibility.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4.svg)](https://tailwindcss.com)

## Key Features

- **Intelligent Job Discovery:** SerpApi-powered LinkedIn Posts search with boolean query support
- **AI-Powered Qualification:** Groq/Llama3 evaluates jobs against your resume and assigns 0-100 match scores
- **Cold Outreach Automation:** Personalized email generation for high-match opportunities (score ≥ 85)
- **Gap Analysis Dashboard:** Visual analytics of skill gaps across rejected jobs with AI recommendations
- **Production-Grade Architecture:** Pydantic-validated LLM outputs, async throughout, comprehensive test coverage

## Tech Stack

### Backend
- **Language:** Python 3.11+
- **Framework:** FastAPI (async)
- **Database:** Supabase (PostgreSQL) + pgvector extension
- **LLM Engine:** Llama 3 via Groq API
- **Data Ingestion:** SerpApi
- **Validation:** Pydantic v2
- **Testing:** pytest (31/31 tests passing)

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS v4
- **UI Library:** Shadcn/ui + Radix UI
- **Charts:** Recharts
- **Icons:** Lucide React
- **Routing:** React Router v6

### Architecture Principles
- **Backend First:** API-first development with complete backend before frontend
- **KISS:** Straightforward, linear code without over-engineering
- **Async by Default:** All endpoints and external API calls are async
- **Bulletproof JSON:** Pydantic validation on all LLM outputs with retry logic
- **Environment-Driven:** Never hardcoded secrets, uses `.env` throughout

## Prerequisites

- Python 3.11 or higher
- Node.js 18+ and npm
- Supabase account (for PostgreSQL + pgvector)
- Groq API key
- SerpApi key

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/agentichire.git
cd agentichire
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Environment setup
cp .env.example .env
# Edit .env with your credentials:
# - SUPABASE_URL
# - SUPABASE_KEY
# - GROQ_API_KEY
# - SERPAPI_KEY
```

### 3. Database Setup

Ensure your Supabase project has:
- PostgreSQL database
- pgvector extension enabled
- Tables: `raw_posts`, `qualified_jobs`, `outreach_emails`

### 4. Run Backend

```bash
# Development (auto-reload)
python -m uvicorn app.main:app --reload --port 8003

# Production
python -m uvicorn app.main:app --port 8003
```

API documentation available at `http://localhost:8003/docs`

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev
```

**Access:** http://localhost:5173

The Vite dev server proxies `/api/*` requests to the backend automatically.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build (port 4173) |
| `python -m uvicorn app.main:app --port 8003` | Start FastAPI server |
| `pytest` (backend) | Run backend test suite |

## Architecture

### System Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   SerpApi       │────▶│   FastAPI        │────▶│   Supabase      │
│   (LinkedIn     │     │   Backend        │     │   (PostgreSQL)  │
│   Posts)        │     │   :8003          │     │                 │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌─────────┐ ┌──────────┐ ┌──────────┐
              │ Ingest  │ │ Qualify  │ │ Outreach │
              │ Agent   │ │ Agent    │ │ Agent    │
              └─────────┘ └──────────┘ └──────────┘
                    │            │            │
                    └────────────┼────────────┘
                                 │
                                 ▼
                          ┌─────────────┐
                          │  Groq API   │
                          │  (Llama 3)  │
                          └─────────────┘
```

### Data Flow

```
User Query → SerpApi → Raw Posts (Supabase)
                ↓
         Qualification Agent
                ↓
    Match Score + Analysis (Supabase)
                ↓
    ┌───────────┴───────────┐
    ▼                       ▼
High Match (≥85)      Gap Analysis
    │                       │
    ▼                       ▼
Cold Outreach        Dashboard Charts
Generation
```

### Directory Structure

```
AgenticHire/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── routers/             # API endpoints
│   │   │   ├── health.py        # Health check
│   │   │   ├── ingest.py        # Data ingestion
│   │   │   ├── qualify.py       # Job qualification
│   │   │   └── outreach.py      # Email generation
│   │   ├── agents/              # LLM agents
│   │   ├── models/              # Pydantic schemas
│   │   └── services/            # Business logic
│   ├── tests/                   # pytest suite (31 tests)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/               # Dashboard, Jobs, Outreach, GapAnalysis
│   │   ├── components/            # Sidebar, ThemeToggle, ScoreBadge
│   │   ├── components/ui/         # Shadcn components
│   │   ├── lib/                   # API client, utilities
│   │   └── App.tsx                # Router setup
│   ├── tests/e2e/               # Playwright tests
│   └── package.json
└── scripts/
    └── verify-build.sh            # Build verification
```

### AI Agents Architecture

#### Agent 1 — Qualification Agent (LLM-as-judge)
- **Input:** Job post text + CV/resume text
- **Output:** `{ match_score: int (0-100), reasoning: str, missing_skills: list[str], strong_points: list[str] }`
- **Validation:** Pydantic model `QualificationResult`
- **Threshold:** Posts with score ≥ 85 trigger Cold Outreach Agent

#### Agent 2 — Cold Outreach Agent
- **Input:** High-score job post + company context
- **Output:** Personalized cold email draft with subject line, body, and hiring manager tips
- **Strategy:** Combines RevOps expertise with technical AI profile

#### Agent 3 — Gap Analysis Engine
- **Input:** Aggregated data from all rejected/low-score postings
- **Output:** `{ skill_gaps: [{ skill: str, frequency: int, percentage: float }], recommendation: str }`
- **Display:** Interactive Recharts bar chart + AI recommendation panel

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/ingest` | Ingest jobs from SerpApi |
| POST | `/api/v1/qualify` | Run qualification on ingested posts |
| GET | `/api/v1/jobs` | List qualified jobs with filters |
| POST | `/api/v1/outreach/{job_id}` | Generate cold email |
| GET | `/api/v1/gap-analysis` | Get skill gap analytics |

## Testing

### Backend Tests (31/31 passing)

```bash
cd backend
pytest -v
```

### E2E Tests (Playwright)

```bash
cd frontend
python -m webapp-testing.scripts.with_server --server "npm run preview" --port 4173 -- python tests/e2e/test_dashboard.py
```

Or run the full verification:

```bash
bash scripts/verify-build.sh
```

## Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_KEY` | Supabase service role key | Yes |
| `GROQ_API_KEY` | Groq API key for Llama 3 | Yes |
| `SERPAPI_KEY` | SerpApi key for LinkedIn search | Yes |

### Frontend (.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `''` (uses proxy) |

## Production Deployment

### 1. Build Frontend

```bash
cd frontend
npm run build
```

Static files output to `frontend/out/`

### 2. Deploy Backend

Deploy the FastAPI backend to your preferred platform (AWS, GCP, Azure, etc.)

### 3. Configure Frontend

Serve the `out/` directory as static files with SPA fallback:

**Nginx example:**
```nginx
server {
    listen 80;
    root /path/to/frontend/out;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8003;
    }
}
```

## Key Design Decisions

### Why LinkedIn Posts vs Jobs Tab?
- **Lower competition:** Posts receive fewer applicants than formal job listings
- **Recent opportunities:** Posted hours/days ago, not weeks
- **Direct access:** Often posted by hiring managers directly

### Why Pydantic Validation?
- LLMs can hallucinate JSON formats
- Structured outputs ensure type safety
- Automatic retry logic on validation failures

### Why Tailwind v4?
- `@theme inline` for CSS variables
- Built-in dark mode support
- Smaller bundle size with purge

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

This is a personal project, but feel free to fork and adapt for your own job search!

---

**Built with:** FastAPI + React + Groq + Supabase + Tailwind v4
