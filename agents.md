# Project: AgenticHire - AI Job Qualification SaaS

## 1. Project Overview

We are building a production-grade SaaS that automatically finds and qualifies job postings using an "LLM-as-a-judge" approach. The system searches for jobs in **LinkedIn Posts** (not the Jobs tab — competitive advantage: fewer applicants per post), evaluates them against a resume, and outputs a "Match Score" with structured gap analysis.

**Strategic Differentiator:** Busca em Posts do LinkedIn via query booleana customizável (ex: `("python") AND ("hire" OR "hiring") AND ("LATAM" OR "remote") AND ("junior")`), mostrando vagas recentes com menos visibilidade e menos concorrentes.

## 2. Tech Stack

- **Backend:** Python 3.11+, FastAPI
- **Frontend:** React (TypeScript)
- **Database:** Supabase (PostgreSQL) + pgvector extension for semantic search
- **Data Ingestion:** SerpApi — bypasses anti-bot systems, handles proxies, returns clean JSON from LinkedIn Posts search
- **LLM Engine:** Llama 3 via Groq API. Use the standard `openai` Python package pointing to the Groq base URL (`https://api.groq.com/openai/v1`)
- **JSON Validation:** Pydantic v2 — all LLM outputs MUST be validated against Pydantic models
- **Orchestration:** Custom sequential Python pipeline (no CrewAI/LangGraph for MVP — KISS principle)

## 3. Architectural Rules & Reliability (Strict)

- **Backend First:** Build and test the FastAPI backend + Supabase connection completely before touching React frontend
- **Bulletproof JSON via Pydantic:** Open-source models can hallucinate JSON formats. ALWAYS validate Groq/Llama output with Pydantic. Implement retry: if output is invalid, catch exception → reprompt once → fail gracefully with structured error response
- **Keep it Simple (KISS):** Write straightforward, linear code with clear function names. Avoid clever hacks or over-engineered inheritance
- **Async by Default:** All FastAPI endpoints and external API calls (Groq, SerpApi, Supabase) must be async
- **Environment Variables:** NEVER hardcode API keys. Use `.env` + `python-dotenv`. Add `.env` to `.gitignore` immediately
- **Structured Outputs:** LLM must return structured JSON matching Pydantic schema. Use system prompts that enforce JSON format explicitly

## 4. AI Agents Architecture

### Agent 1 — Qualification Agent (LLM-as-judge)
- **Input:** Job post text + CV/resume text
- **Output:** `{ match_score: int (0-100), reasoning: str, missing_skills: list[str], strong_points: list[str] }`
- **Validation:** Pydantic model `QualificationResult`
- **Threshold:** Posts with score ≥ 85 trigger the Cold Outreach Agent

### Agent 2 — Cold Outreach Agent
- **Input:** High-score job post + company name/role
- **Output:** Personalized cold email draft targeting the Hiring Manager
- **Strategy:** Combines RevOps/Sales expertise context with technical AI profile

### Agent 3 — Gap Analysis Engine
- **Input:** Aggregated data from all rejected/low-score postings
- **Output:** `{ skill_gaps: [{ skill: str, frequency: int, percentage: float }], recommendation: str }`
- **Display:** Visual panel in React dashboard

## 5. Data Pipeline Flow

```
SerpApi Query (boolean search on LinkedIn Posts)
    ↓
Raw JSON posts → Supabase (raw_posts table)
    ↓
Qualification Agent (Groq/Llama3) → Match Score
    ↓
Supabase (qualified_jobs table with score + reasoning)
    ↓
React Dashboard (filtered, sorted by score + date)
    ↓
[score ≥ 85] → Cold Outreach Agent
[aggregated] → Gap Analysis Engine
```

## 6. Claude Code Workflow Guidelines

You act as my **Junior Developer**. I am the **Senior AI Systems Architect**. Follow these rules:

- **Plan Before Coding:** Before writing any code, outline the steps, potential risks, and quick tests. ALWAYS ask for my approval before generating actual code
- **Test-Driven Development (TDD):** Write tests based on expected inputs/outputs BEFORE writing actual Python functions. Confirm tests fail → write code to pass them → never modify tests to make code pass
- **Modular Steps:** Do not build the whole app at once. Work in small, focused modules. Use `clear` command between tasks to reset context window and prevent hallucinations
- **Commit Frequently:** After each working module, recommend a git commit with Conventional Commits format (`feat:`, `fix:`, `test:`, `docs:`)
- **Verify Before Continuing:** After each module, run the tests and show the results before moving to the next task

## 7. Development Phases

- **Phase 1 (Backend Foundation):** FastAPI setup + Supabase connection + health check route
- **Phase 2 (Data Ingestion):** SerpApi integration + raw posts storage pipeline
- **Phase 3 (AI Intelligence):** Qualification Agent with Pydantic validation + TDD
- **Phase 4 (Extended Agents):** Cold Outreach Agent + Gap Analysis Engine
- **Phase 5 (Frontend):** React dashboard with filters, match scores, gap analysis panel
- **Phase 6 (Polish):** Error handling, logging, observability, README documentation

## 8. How to Start

In the Claude Code terminal:

> "Read the agents.md file to understand the architecture and rules. For Phase 1, please create the basic FastAPI setup, the connection to Supabase, and a health check route. Show me the plan and wait for my approval before writing the code."
