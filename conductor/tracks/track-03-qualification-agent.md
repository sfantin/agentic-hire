# Track 03 — Qualification Agent (LLM-as-Judge)

**Status:** 🔒 BLOCKED (aguarda Track 02)  
**Phase:** 3 of 6  
**Goal:** Groq/Llama3 avalia cada post contra o CV e retorna Match Score estruturado via Pydantic

---

## Goal
Implementar o Qualification Agent que usa Groq API (Llama 3) para avaliar posts brutos contra o CV do usuário, retornando um JSON estruturado validado com Pydantic.

---

## Pydantic Model (Output do LLM)

```python
class QualificationResult(BaseModel):
    match_score: int = Field(ge=0, le=100)
    reasoning: str
    missing_skills: list[str]
    strong_points: list[str]
    is_high_match: bool  # score >= 85
```

## Tasks (Visão Geral)

- [ ] **T1:** Criar `app/services/groq_client.py` — wrapper para Groq via openai SDK
- [ ] **T2:** Criar `app/models/qualification.py` — Pydantic model `QualificationResult`
- [ ] **T3:** Criar `app/agents/qualification_agent.py` — prompt + retry logic
- [ ] **T4:** Escrever testes TDD (mock Groq API, testar Pydantic validation)
- [ ] **T5:** Criar tabela `qualified_jobs` no Supabase
- [ ] **T6:** Endpoint `POST /api/v1/qualify` — processa raw_posts não qualificados
- [ ] **T7:** Endpoint `GET /api/v1/jobs` — lista jobs qualificados com filtros

---

## Schema `qualified_jobs`

```sql
CREATE TABLE qualified_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_post_id UUID REFERENCES raw_posts(id),
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    reasoning TEXT,
    missing_skills TEXT[],
    strong_points TEXT[],
    is_high_match BOOLEAN DEFAULT FALSE,
    qualified_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_qualified_jobs_score ON qualified_jobs(match_score DESC);
CREATE INDEX idx_qualified_jobs_high_match ON qualified_jobs(is_high_match);
```

## Retry Pattern (Pydantic Validation)

```python
async def qualify_post(post_text: str, cv_text: str) -> QualificationResult:
    for attempt in range(2):  # max 2 tentativas
        try:
            response = await groq_client.chat(...)
            return QualificationResult.model_validate_json(response)
        except ValidationError:
            if attempt == 1:
                raise  # fail gracefully na segunda tentativa
```

---

## Done When
- [ ] `pytest` passa todos os testes do agente (com Groq mockado)
- [ ] `POST /api/v1/qualify` processa 5 posts e salva scores no Supabase
- [ ] Commit: `feat: qualification agent - Groq/Llama3 + Pydantic validation`
