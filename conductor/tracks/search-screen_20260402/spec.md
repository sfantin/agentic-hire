# Specification: Search Screen

**Track ID:** search-screen_20260402
**Type:** Feature
**Created:** 2026-04-02
**Status:** Draft

## Summary

Nova tela `/search` onde o usuário gerencia uma biblioteca de queries booleanas salvas, cola novas queries, seleciona qual rodar, e dispara o pipeline (ingest + qualify) com um clique. Os resultados vão para a tela Jobs ordenados por match score.

## Context

O AgenticHire busca vagas em posts do LinkedIn via queries booleanas (SerpApi). Cada query traz resultados diferentes. O usuário quer poder manter um conjunto de queries úteis (ex: python, react, fastapi) e rodar qualquer uma sob demanda, sem precisar reeditar código. Os resultados de todas as queries se acumulam no banco e são exibidos juntos na tela Jobs, sempre do maior match para o menor.

## User Story

Como usuário do AgenticHire, quero ter uma tela onde eu possa ver minhas queries salvas, colar uma nova query, selecionar uma e rodar, para que novos posts sejam buscados e qualificados automaticamente e eu veja os resultados mais relevantes no Jobs.

## Acceptance Criteria

- [ ] Tela `/search` exibe lista de queries salvas (persistidas em localStorage)
- [ ] Usuário pode selecionar uma query da lista para rodá-la
- [ ] Campo de texto livre permite colar qualquer query booleana nova
- [ ] Botão "Salvar" adiciona query do campo livre à biblioteca
- [ ] Botão "Run" dispara pipeline com a query selecionada/digitada
- [ ] Durante execução: spinner + status "Buscando..." → "Qualificando..." → "✓ N posts, M qualificados"
- [ ] Após Run bem-sucedido: redireciona para `/jobs` OU mostra preview dos novos jobs
- [ ] Queries salvas podem ser deletadas da biblioteca
- [ ] Queries padrão pré-carregadas baseadas no CV do Sérgio

## Queries Padrão (pré-carregadas)

```
("python") AND ("hire" OR "hiring") AND ("LATAM" OR "remote") AND ("junior" OR "senior")
("react") AND ("hire" OR "hiring") AND ("LATAM" OR "remote") AND ("junior" OR "senior")
("fastapi") AND ("hire" OR "hiring") AND ("LATAM" OR "remote")
("AI engineer") AND ("hire" OR "hiring") AND ("remote")
```

## Dependencies

- Track `fix-ingest-pipeline_20260402` deve estar concluído (endpoint `/api/v1/run-query`)
- `frontend/src/lib/api.ts` com `runQuery()`
- React Router já configurado no projeto

## Out of Scope

- Agendamento automático (cron) de queries
- Sincronização de queries no backend/banco
- Histórico de execuções por query
- Edição inline de queries salvas

## Technical Notes

- Queries salvas em `localStorage` key `agentic_hire_queries` (array de strings)
- Sem necessidade de endpoint backend para gerenciar queries — é config local do usuário
- Estado de execução gerenciado com `useState` local (não precisa de Zustand/React Query para MVP)
- Componente principal: `frontend/src/pages/Search.tsx`
