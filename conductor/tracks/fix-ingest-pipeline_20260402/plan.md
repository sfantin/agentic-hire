# Implementation Plan: Fix Ingest Pipeline

**Track ID:** fix-ingest-pipeline_20260402
**Spec:** [spec.md](./spec.md)
**Created:** 2026-04-02
**Status:** [ ] Not Started

## Overview

Corrigir 3 bugs de contrato frontend/backend e criar endpoint unificado `/api/v1/run-query` que executa ingest + qualify em uma chamada. Dashboard passa a chamar este endpoint e atualiza jobs automaticamente.

---

## Phase 1: Fix Backend Contract

Corrigir o endpoint `/api/v1/ingest` para aceitar body JSON e retornar campos corretos. Criar novo endpoint unificado `/api/v1/run-query`.

### Tasks

- [ ] 1.1: Atualizar `backend/app/routers/ingest.py`
  - Trocar `Query(default=DEFAULT_QUERY)` por `Body(embed=True)` com campo `query: str`
  - Alinhar response: retornar `{ "ingested": int, "posts": list }`
- [ ] 1.2: Criar `backend/app/routers/run_query.py`
  - Endpoint `POST /api/v1/run-query` com body `{ "query": string, "limit": int = 5 }`
  - Executa: `ingest_posts(query)` → `qualify_unprocessed(limit)` em sequência
  - Retorna: `{ "ingested": int, "qualified": int, "query": string }`
- [ ] 1.3: Registrar novo router em `backend/app/main.py`

### Verification

- [ ] `POST /api/v1/run-query` com body `{ "query": "...", "limit": 3 }` retorna `{ ingested, qualified, query }`

---

## Phase 2: Fix Frontend API Client

Atualizar `api.ts` para usar o novo endpoint unificado.

### Tasks

- [ ] 2.1: Atualizar `frontend/src/lib/api.ts`
  - Remover função `ingest()` e `qualify()` separadas (ou manter como internal)
  - Adicionar `runQuery(query: string, limit?: number): Promise<RunQueryResponse>`
  - Interface `RunQueryResponse: { ingested: number, qualified: number, query: string }`

### Verification

- [ ] `api.runQuery("test query")` retorna objeto correto sem erros de TypeScript

---

## Phase 3: Fix Dashboard UX

Atualizar Dashboard para usar `runQuery` e recarregar jobs após sucesso.

### Tasks

- [ ] 3.1: Atualizar `frontend/src/pages/Dashboard.tsx`
  - Substituir `handleIngest` + `handleQualify` por único `handleRunQuery(query)`
  - Query padrão temporária: `DEFAULT_QUERY` (será substituído pela Search Screen)
  - Após sucesso: chamar `api.getJobs()` e atualizar `data`
  - Mensagem de feedback: `✓ Ingested {N} posts, qualified {M} · {query}`
- [ ] 3.2: Simplificar botões: remover "Qualify" separado, manter "Run" (renomear Ingest)

### Verification

- [ ] Clicar "Run" no Dashboard: mostra spinner → mensagem com contagem real → jobs atualizam

---

## Final Verification

- [ ] Ciclo completo funciona: Run → posts no Supabase → jobs aparecem na tela
- [ ] Sem erros no console do browser
- [ ] Backend retorna 200 com campos corretos
