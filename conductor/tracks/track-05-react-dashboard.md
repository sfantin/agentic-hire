# Track 05 — React SaaS Dashboard

**Status:** 🔒 BLOCKED (aguarda Track 04)  
**Phase:** 5 of 6  
**Goal:** Interface SaaS profissional com dashboard de vagas, filtros booleanos, match scores e gap analysis

---

## Goal
Construir o frontend React + TypeScript com visual de SaaS B2B profissional (dark mode, Shadcn/ui), conectado ao backend FastAPI.

---

## Screens

### 1. Dashboard Principal (`/`)
- Lista de vagas qualificadas ordenadas por Match Score DESC
- Badge de score: 🟢 ≥85 | 🟡 60-84 | 🔴 <60
- Data do post + nome do autor
- Botão "Generate Cold Email" (para scores ≥ 85)

### 2. Painel de Filtros (sidebar ou top bar)
- Campo de query booleana editável (textarea)
- Botão "Run Search" → trigger do ingest
- Filtros: score mínimo, data, processado/não

### 3. Gap Analysis Panel (`/gap-analysis`)
- Gráfico de barras horizontal (Recharts)
- Top 10 skills faltando + frequência + %
- Recomendação da IA no topo

### 4. Job Detail Modal
- Post completo
- Score + reasoning completo
- Missing skills + strong points
- Draft de cold email (se gerado)

---

## Tech Stack Frontend

```
React 18 + TypeScript + Vite
Shadcn/ui (dark mode)
Recharts (gap analysis chart)
React Query (server state)
Zustand (local state: query, filtros)
Axios ou fetch nativo
```

---

## Tasks (Visão Geral)
- [ ] Setup Vite + React + TypeScript + Shadcn
- [ ] Configurar dark mode e design tokens
- [ ] Componente `JobCard` com Match Score badge
- [ ] Componente `BooleanQueryEditor` com syntax highlight básico
- [ ] Página Dashboard com lista paginada
- [ ] Integração com `GET /api/v1/jobs`
- [ ] Página Gap Analysis com Recharts
- [ ] Modal de detalhe do job com cold email

---

## Done When
- [ ] Dashboard exibe vagas do Supabase com scores corretos
- [ ] Filtro booleano funcional — altera query e re-busca
- [ ] Gap Analysis exibe gráfico com dados reais
- [ ] Dark mode elegante, parece SaaS de produção
- [ ] Commit: `feat: React SaaS dashboard - jobs + filters + gap analysis`
