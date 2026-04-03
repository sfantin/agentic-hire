# Specification: Fix Ingest Pipeline

**Track ID:** fix-ingest-pipeline_20260402
**Type:** Bug
**Created:** 2026-04-02
**Status:** Draft

## Summary

O pipeline de ingestão está silenciosamente quebrado em 3 camadas: mismatch de parâmetros entre frontend/backend, mismatch de nome de campo na resposta, e ausência de refresh da UI após ingest bem-sucedido.

## Context

O AgenticHire usa SerpApi para buscar posts do LinkedIn com query booleana, salva em `raw_posts`, qualifica via LLM (Groq) e salva em `qualified_jobs`. O botão Ingest no Dashboard deveria disparar esse fluxo, mas falha silenciosamente por incompatibilidades de contrato entre frontend e backend.

## Bugs Identificados

### Bug 1: Body/Query param mismatch
- **Frontend** (`api.ts:69`): envia POST com JSON body `{ search_query: string, limit: number }`
- **Backend** (`ingest.py:9`): espera `query` como **query param** (`?query=...`), ignora body completamente
- **Efeito:** sempre usa `DEFAULT_QUERY` hardcoded, nunca a query do usuário

### Bug 2: Response field name mismatch
- **Backend** retorna `{ "inserted": N, "posts": [...] }`
- **Frontend** espera `{ "ingested": N, "message": string }`
- **Efeito:** Dashboard mostra "Ingested 0 new posts" mesmo quando posts foram salvos

### Bug 3: Sem refresh após ingest
- `Dashboard.tsx:63`: após ingest bem-sucedido, não chama `api.getJobs()` novamente
- **Efeito:** a tela permanece com dados antigos mesmo após novos posts serem inseridos

### Bug 4: Pipeline dividido (UX)
- O usuário precisa clicar "Ingest" e depois "Qualify" manualmente
- Deveria ser uma ação unificada: buscar + qualificar + atualizar

## Acceptance Criteria

- [ ] POST `/api/v1/ingest` aceita body JSON `{ "query": string, "limit": number }`
- [ ] Response retorna `{ "ingested": number, "qualified": number }`
- [ ] Endpoint unificado `/api/v1/run-query` executa ingest + qualify em sequência
- [ ] Dashboard atualiza `jobs` automaticamente após run-query bem-sucedido
- [ ] Mensagem de feedback mostra contagem real de posts novos

## Dependencies

- `backend/app/routers/ingest.py`
- `backend/app/routers/qualify.py`
- `frontend/src/lib/api.ts`
- `frontend/src/pages/Dashboard.tsx`

## Out of Scope

- Nova tela de Search (track separado)
- Gerenciamento de queries salvas
- Agendamento automático (cron)

## Technical Notes

O endpoint unificado pode ser implementado em `backend/app/routers/search.py` que internamente chama `ingest_posts()` e depois `qualify_post()` do serviço existente. Isso evita duplicação e mantém o código organizado.
