# AgenticHire — Master Plan de Execução

**Data:** 2026-04-02  
**Status:** Em andamento

---

## Visão do produto (modelo mental acordado)

```
USUÁRIO ESCOLHE UMA QUERY  →  [Run]  →  INGEST + QUALIFY  →  JOBS ordenados por match
```

- Uma query por vez
- Resultados se acumulam no banco (`raw_posts` + `qualified_jobs`)
- Jobs screen sempre mostra TUDO do maior match_score para o menor
- A query de origem fica como metadado visível, mas não altera a ordenação

### Tela Search (UX alvo)

```
┌─────────────────────────────────────────────────────────────┐
│  Search                                                      │
├─────────────────────────────────────────────────────────────┤
│  Suas queries salvas:                                        │
│                                                              │
│  ● ("python") AND ("hiring") AND ("LATAM")   [▶ Run] [✕]   │
│  ○ ("react") AND ("hiring") AND ("LATAM")    [▶ Run] [✕]   │
│  ○ ("fastapi") AND ("hiring") AND ("remote") [▶ Run] [✕]   │
│  ○ ("AI engineer") AND ("hiring")            [▶ Run] [✕]   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Cole uma nova query aqui:                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ("node.js") AND ("hire" OR "hiring") AND ("remote")   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                    [Salvar na lista] [▶ Run] │
├─────────────────────────────────────────────────────────────┤
│  Status: ✓ 8 posts novos, 6 qualificados · python · 2min    │
└─────────────────────────────────────────────────────────────┘
```

---

## Bugs identificados (por que o sistema não funciona hoje)

| # | Arquivo | Problema | Efeito |
|---|---------|----------|--------|
| B1 | `ingest.py:9` | Backend espera `?query=` como query param, frontend envia JSON body | Query do usuário ignorada, usa sempre DEFAULT_QUERY |
| B2 | `ingest.py` / `api.ts` | Backend retorna `"inserted"`, frontend espera `"ingested"` | Sempre mostra "0 posts" mesmo quando salvou |
| B3 | `Dashboard.tsx:63` | Após ingest, não chama `api.getJobs()` novamente | Tela fica estática com dados antigos |
| B4 | Dashboard UX | Botões "Ingest" e "Qualify" separados — usuário precisa clicar 2x | Pipeline incompleto |

---

## Track 1 — `fix-ingest-pipeline_20260402`

**Tipo:** Bug fix  
**Prioridade:** 🔴 Alta — pré-requisito para tudo  
**Arquivos:** `backend/app/routers/`, `frontend/src/lib/api.ts`, `frontend/src/pages/Dashboard.tsx`

### Passo 1.1 — Novo endpoint unificado no backend

**Arquivo:** `backend/app/routers/run_query.py` (criar)

```python
POST /api/v1/run-query
Body: { "query": string, "limit": int = 10 }
Response: { "ingested": int, "qualified": int, "query": string }
```

Internamente: chama `ingest_posts(query)` → chama `qualify_unprocessed(limit)` → retorna contagens.

**Arquivo:** `backend/app/main.py` — registrar o novo router.

### Passo 1.2 — Atualizar cliente HTTP no frontend

**Arquivo:** `frontend/src/lib/api.ts`

- Remover `ingest()` e `qualify()` separados
- Adicionar `runQuery(query: string, limit?: number): Promise<RunQueryResponse>`
- Interface: `RunQueryResponse = { ingested: number, qualified: number, query: string }`

### Passo 1.3 — Corrigir Dashboard

**Arquivo:** `frontend/src/pages/Dashboard.tsx`

- Substituir `handleIngest` + `handleQualify` por `handleRun(query: string)`
- Query temporária hardcoded: `DEFAULT_QUERY` (removida quando Search Screen ficar pronta)
- Após Run bem-sucedido: chamar `api.getJobs()` → `setData(fresh)`
- Feedback: `✓ {ingested} posts novos, {qualified} qualificados`
- Renomear botão "Ingest" → "Run", remover botão "Qualify"

### Verificação Track 1

```
1. Abrir Dashboard
2. Clicar "Run"
3. Ver spinner + mensagem com contagem REAL
4. Ver lista de Jobs atualizar com novos resultados
5. Abrir Supabase → confirmar novos registros em raw_posts e qualified_jobs
```

---

## Track 2 — `search-screen_20260402`

**Tipo:** Feature  
**Prioridade:** 🟡 Média — depende do Track 1  
**Arquivos:** novos em `frontend/src/`

### Passo 2.1 — Hook de queries salvas

**Arquivo:** `frontend/src/lib/use-saved-queries.ts` (criar)

- Persiste em `localStorage` key `agentic_hire_queries`
- Inicializa com 4 queries padrão se localStorage vazio
- API: `{ queries, add(q), remove(index) }`

**Queries padrão pré-carregadas:**
```
("python") AND ("hire" OR "hiring") AND ("LATAM" OR "remote") AND ("junior" OR "senior")
("react") AND ("hire" OR "hiring") AND ("LATAM" OR "remote") AND ("junior" OR "senior")
("fastapi") AND ("hire" OR "hiring") AND ("LATAM" OR "remote")
("AI engineer") AND ("hire" OR "hiring") AND ("remote")
```

### Passo 2.2 — Página Search

**Arquivo:** `frontend/src/pages/Search.tsx` (criar)

**Seção A — Biblioteca de queries salvas:**
- Lista cada query com botão `[▶ Run]` e `[✕]` (deletar)
- Clicar Run: dispara `api.runQuery(query, 10)` → mostra status

**Seção B — Campo livre:**
- `<textarea>` para colar qualquer query booleana
- `[Salvar na lista]` → adiciona ao hook → aparece na Seção A
- `[▶ Run]` → dispara `api.runQuery(freeQuery, 10)` sem salvar

**Estados:**
- `running: boolean` — spinner no botão ativo, desabilita outros botões
- `statusMessage: string` — feedback de resultado ou erro

### Passo 2.3 — Integração na navegação

**Arquivo:** `frontend/src/App.tsx` — adicionar rota `/search` com `<Search />`

**Arquivo:** `frontend/src/components/Sidebar.tsx` — adicionar item "Search" com ícone `Search` (lucide), entre Dashboard e Jobs

**Arquivo:** `frontend/src/pages/Dashboard.tsx` — remover botão "Run" temporário, substituir por card/link `"Run a search →"` que navega para `/search`

### Verificação Track 2

```
1. Abrir /search → ver 4 queries padrão na lista
2. Clicar Run em "python" → spinner → "✓ 8 posts, 6 qualificados"
3. Navegar para Jobs → ver novos resultados no topo (score desc)
4. Colar query nova no campo → clicar Salvar → aparece na lista
5. Colar query nova → clicar Run direto (sem salvar) → funciona
6. Clicar ✕ em uma query → some da lista, persiste após reload
```

---

## Ordem de execução

```
[AGORA]  Track 1, Passo 1.1 → 1.2 → 1.3 → Verificação
         ↓
[DEPOIS] Track 2, Passo 2.1 → 2.2 → 2.3 → Verificação
```

Cada passo é independente dentro do track — pode ser feito e testado individualmente.

---

## O que NÃO está no escopo (para não desviar)

- Agendamento automático (cron) de queries
- Sincronização de queries no backend
- Histórico de execuções
- Edição inline de queries salvas
- Paginação na tela Jobs
- Filtro por data na tela Jobs
