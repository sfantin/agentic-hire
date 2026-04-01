# Track 01 — Backend Foundation

**Status:** 🔜 TODO  
**Phase:** 1 of 6  
**Goal:** FastAPI rodando localmente + Supabase conectado + health check endpoint retornando 200

---

## Goal
Criar a base do servidor FastAPI com estrutura de produção, conexão validada com Supabase, e um endpoint de health check funcional com testes passando.

---

## Tasks

- [ ] **T1: Criar estrutura de diretórios do projeto**
  → Verify: `tree /F` mostra a estrutura correta sem arquivos faltando

- [ ] **T2: Criar e ativar ambiente virtual Python + instalar dependências**
  → Verify: `pip list` mostra fastapi, uvicorn, supabase, pydantic, python-dotenv, pytest, pytest-asyncio

- [ ] **T3: Criar `.env` e `.env.example` com variáveis obrigatórias**
  → Verify: `.env` existe, `.env.example` sem valores reais, `.gitignore` inclui `.env`

- [ ] **T4: Criar `app/config.py` com Pydantic Settings para carregar env vars**
  → Verify: `python -c "from app.config import settings; print(settings.supabase_url)"` retorna URL sem erro

- [ ] **T5: Escrever TESTE para o health check endpoint (TDD - RED)**
  → Verify: `pytest tests/test_health.py` falha com `ImportError` ou `404`

- [ ] **T6: Criar `app/main.py` com FastAPI + lifespan + rota `/health`**
  → Verify: `pytest tests/test_health.py` passa (GREEN) ✅

- [ ] **T7: Criar `app/database.py` com cliente Supabase async**
  → Verify: `python -c "from app.database import get_supabase_client; print('OK')"` sem erro

- [ ] **T8: Escrever TESTE para conexão Supabase (TDD - RED)**
  → Verify: `pytest tests/test_database.py` falha (sem tabela ainda)

- [ ] **T9: Criar tabela `raw_posts` no Supabase via migration SQL**
  → Verify: Supabase dashboard mostra tabela `raw_posts` com schema correto

- [ ] **T10: Rodar todos os testes + iniciar servidor**
  → Verify: `pytest` passa 100% | `uvicorn app.main:app --reload` | `curl localhost:8000/health` retorna `{"status":"ok"}`

---

## Done When
- [ ] `pytest` → todos os testes passando, 0 falhas
- [ ] `curl http://localhost:8000/health` → `{"status": "ok", "supabase": "connected"}`
- [ ] `curl http://localhost:8000/docs` → Swagger UI abre sem erro
- [ ] `.env` no `.gitignore` confirmado
- [ ] Commit: `feat: backend foundation - FastAPI + Supabase + health check`

---

## Estrutura de Diretórios (Target)

```
AgenticHire/
├── agents.md
├── conductor/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          ← FastAPI app + lifespan + routers
│   │   ├── config.py        ← Pydantic Settings (env vars)
│   │   ├── database.py      ← Supabase client factory
│   │   └── routers/
│   │       └── health.py    ← /health endpoint
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_health.py   ← TDD: health check
│   │   └── test_database.py ← TDD: Supabase connection
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
└── frontend/                ← vazio por enquanto (Phase 5)
```

---

## Padrões FastAPI de Produção (fastapi-pro skill)

### Lifespan Pattern (startup/shutdown)
```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup: inicializar conexões
    yield
    # shutdown: fechar conexões

app = FastAPI(lifespan=lifespan)
```

### Pydantic Settings Pattern (config.py)
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    groq_api_key: str
    serpapi_key: str
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Health Check Pattern
```python
# GET /health → {"status": "ok", "supabase": "connected", "version": "1.0.0"}
```

### TDD Pattern com pytest-asyncio
```python
# tests/test_health.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
```

---

## Schema SQL — Tabela `raw_posts`

```sql
CREATE TABLE raw_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkedin_post_id TEXT UNIQUE,
    raw_text TEXT NOT NULL,
    author_name TEXT,
    author_url TEXT,
    post_url TEXT,
    posted_at TIMESTAMPTZ,
    search_query TEXT,
    ingested_at TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE
);

-- Index para busca por data e processamento
CREATE INDEX idx_raw_posts_ingested_at ON raw_posts(ingested_at DESC);
CREATE INDEX idx_raw_posts_processed ON raw_posts(processed);
```

---

## Variáveis de Ambiente (.env.example)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Groq (Llama 3 via API compatível com OpenAI)
GROQ_API_KEY=gsk_...

# SerpApi
SERPAPI_KEY=your-serpapi-key

# App
APP_ENV=development
APP_VERSION=0.1.0
```

---

## Requirements.txt (Phase 1)

```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
supabase>=2.0.0
python-dotenv>=1.0.0
httpx>=0.27.0
pytest>=8.0.0
pytest-asyncio>=0.23.0
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Supabase key inválida no teste | Alta | Usar variável de env mockada em tests |
| Versão Python incompatível | Baixa | Exigir Python 3.11+ explicitamente |
| Conflito de dependências | Média | Usar venv isolado por projeto |
| `.env` commitado por acidente | Alta | Verificar `.gitignore` ANTES do primeiro commit |

---

## Prompt para Iniciar no Claude Code

```
Read the agents.md file first.

For Track 01 (Backend Foundation), follow the plan in 
conductor/tracks/track-01-backend-foundation.md.

Start with T1 and T2 only. Show me the exact commands to run 
and the exact file structure you will create. Wait for my 
approval before writing any code.
```
