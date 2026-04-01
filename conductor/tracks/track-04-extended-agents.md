# Track 04 — Cold Outreach + Gap Analysis

**Status:** 🔒 BLOCKED (aguarda Track 03)  
**Phase:** 4 of 6  
**Goal:** Agent de cold email para matches ≥ 85 + painel de gap analysis agregado

---

## Goal
Implementar Agent 2 (Cold Outreach) e Agent 3 (Gap Analysis Engine) completando a camada de inteligência do sistema.

---

## Agent 2 — Cold Outreach

**Trigger:** `is_high_match = TRUE` (score ≥ 85)

```python
class ColdOutreachResult(BaseModel):
    subject_line: str
    email_body: str
    hiring_manager_tip: str  # dica de onde encontrar o HM
    tone: str  # "formal" | "conversational"
```

### Tasks
- [ ] Criar `app/agents/cold_outreach_agent.py`
- [ ] Endpoint `POST /api/v1/outreach/{job_id}` — gera draft de email
- [ ] Salvar drafts na tabela `outreach_drafts`

---

## Agent 3 — Gap Analysis Engine

**Input:** Todos os jobs com score < 85
**Output:** Skills mais frequentemente faltando + recomendação de estudo

```python
class SkillGap(BaseModel):
    skill: str
    frequency: int
    percentage: float

class GapAnalysisResult(BaseModel):
    skill_gaps: list[SkillGap]
    recommendation: str
    analysis_period_days: int
```

### Tasks
- [ ] Criar `app/agents/gap_analysis_agent.py`
- [ ] Endpoint `GET /api/v1/gap-analysis` — agrega dados e retorna análise
- [ ] Otimização: cache de 24h para não reprocessar toda hora

---

## Done When
- [ ] `POST /api/v1/outreach/{id}` retorna email draft válido para job com score ≥ 85
- [ ] `GET /api/v1/gap-analysis` retorna top 10 skills faltando com percentuais
- [ ] Commit: `feat: cold outreach agent + gap analysis engine`
