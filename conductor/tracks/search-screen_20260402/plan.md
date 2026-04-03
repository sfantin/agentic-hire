# Implementation Plan: Search Screen

**Track ID:** search-screen_20260402
**Spec:** [spec.md](./spec.md)
**Created:** 2026-04-02
**Status:** [ ] Not Started — depende de fix-ingest-pipeline_20260402

## Overview

Criar tela `/search` com biblioteca de queries em localStorage, campo livre para colar novas queries, e botão Run que dispara `api.runQuery()` mostrando progresso e resultado. Registrar rota no App.tsx e adicionar item na Sidebar.

---

## Phase 1: Lógica de Queries Salvas (localStorage hook)

### Tasks

- [ ] 1.1: Criar `frontend/src/lib/use-saved-queries.ts`
  - Hook `useSavedQueries()` que lê/escreve em `localStorage("agentic_hire_queries")`
  - Retorna: `{ queries: string[], add(q), remove(index), clear() }`
  - Inicializa com queries padrão se localStorage vazio

### Verification

- [ ] Hook retorna queries padrão na primeira vez
- [ ] `add()` e `remove()` persistem ao recarregar a página

---

## Phase 2: Componente Search Screen

### Tasks

- [ ] 2.1: Criar `frontend/src/pages/Search.tsx`
  - Seção "Biblioteca de Queries": lista as queries salvas com botão [▶ Run] e [✕ Delete] por linha
  - Query selecionada fica highlighted
  - Seção "Nova Query": `<textarea>` para colar query livre + botões [Salvar] [▶ Run]
  - Estado: `selectedQuery`, `freeQuery`, `running`, `statusMessage`
- [ ] 2.2: Lógica do botão Run
  - Prioridade: usa `freeQuery` se preenchido, senão `selectedQuery`
  - Chama `api.runQuery(query, 10)`
  - Status: "Buscando posts..." → aguarda resposta → "✓ {ingested} posts novos, {qualified} qualificados"
  - Em caso de erro: mostra mensagem de erro em vermelho
- [ ] 2.3: Feedback visual com estados de loading
  - Botão Run: spinner durante execução, disabled durante loading
  - Badge de status por query (opcional): "última run: X min atrás" via localStorage timestamp

### Verification

- [ ] Selecionar query da lista + Run → dispara pipeline → mostra resultado
- [ ] Colar query no campo livre + Run → dispara pipeline
- [ ] Salvar query nova → aparece na lista
- [ ] Deletar query → some da lista

---

## Phase 3: Integração com Navegação

### Tasks

- [ ] 3.1: Adicionar rota `/search` em `frontend/src/App.tsx`
- [ ] 3.2: Adicionar item "Search" na `frontend/src/components/Sidebar.tsx`
  - Ícone: `Search` do lucide-react
  - Posição: entre Dashboard e Jobs
- [ ] 3.3: Remover botões "Ingest" e "Qualify" do Dashboard
  - Substituir por link/botão "Run a Search →" que navega para `/search`

### Verification

- [ ] Navegação Sidebar → Search funciona
- [ ] Dashboard limpo sem botões de pipeline
- [ ] Fluxo completo: Search → Run → navegar para Jobs → ver novos resultados

---

## Final Verification

- [ ] Todas as acceptance criteria do spec atendidas
- [ ] Sem erros TypeScript
- [ ] Queries padrão aparecem na primeira visita
- [ ] Pipeline completo funciona end-to-end
