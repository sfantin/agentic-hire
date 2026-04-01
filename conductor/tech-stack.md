# Tech Stack — AgenticHire

## Core Languages
- **Python 3.11+** — Backend, pipeline, agents
- **TypeScript** — Frontend React

## Backend
| Component | Technology | Rationale |
|---|---|---|
| API Framework | **FastAPI** | Async-native, tipo-seguro, padrão da indústria para APIs de IA em Python |
| Data Validation | **Pydantic v2** | Valida outputs do LLM, evita JSON malformado, retry automático |
| Async HTTP | **httpx** | Cliente HTTP async para chamadas a SerpApi/Groq |
| Environment | **python-dotenv** | Gestão de secrets, jamais hardcoded |

## Frontend
| Component | Technology | Rationale |
|---|---|---|
| Framework | **React + TypeScript** | SaaS visual profissional, tipagem forte |
| Build tool | **Vite** | Fast DX, hot reload |
| State | **Zustand** ou **React Query** | Simples, sem overhead do Redux para MVP |
| Charts | **Recharts** | Gap Analysis visualização |
| UI Components | **Shadcn/ui** | Design system profissional, dark mode nativo |

## Database & Storage
| Component | Technology | Rationale |
|---|---|---|
| Database | **Supabase (PostgreSQL)** | Managed, auth incluído, free tier generoso |
| Vector Extension | **pgvector** | Busca semântica nativa no Postgres, sem DB extra |
| ORM/Client | **supabase-py** | Client oficial Python para Supabase |

## AI & LLM Layer
| Component | Technology | Rationale |
|---|---|---|
| LLM Provider | **Groq API** | Ultra-fast inference, Llama3 open-source, custo baixíssimo |
| LLM Model | **Llama 3 70B** | Qualidade suficiente para LLM-as-judge, structured outputs |
| SDK | **openai Python package** | Aponta para Groq base URL — compatibilidade total |
| Validation | **Pydantic + retry** | Impede alucinação de JSON quebrar pipeline |

## Data Ingestion
| Component | Technology | Rationale |
|---|---|---|
| Search API | **SerpApi** | Resolve anti-bot, proxies, CAPTCHAs — retorna JSON limpo |
| Target | LinkedIn Posts (não Jobs) | Diferencial competitivo — menos candidatos por vaga |
| Schedule | Cron job / manual trigger | Pipeline roda a cada N horas ou on-demand |

## Infrastructure
| Component | Technology | Rationale |
|---|---|---|
| Hosting (Backend) | **Railway** ou **Render** | Free tier para portfólio, deploy simples via Git |
| Hosting (Frontend) | **Vercel** | Deploy instantâneo React, free tier generoso |
| Database | **Supabase Cloud** | Managed, sem ops |

## Orchestration Decision
> **MVP: Custom sequential Python pipeline** (sem CrewAI / LangGraph)

**Rationale:** Para o MVP, a complexidade de frameworks de orquestração não justifica o overhead. Um pipeline linear em Python é mais fácil de testar, debugar e explicar numa entrevista. Frameworks de orquestração serão considerados na v2.

## Key Dependencies (requirements.txt)
```
fastapi>=0.115.0
uvicorn>=0.30.0
pydantic>=2.0.0
supabase>=2.0.0
openai>=1.0.0          # used with Groq base URL
httpx>=0.27.0
python-dotenv>=1.0.0
pytest>=8.0.0
pytest-asyncio>=0.23.0
```
