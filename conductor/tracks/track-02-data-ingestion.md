# Track 02 — Data Ingestion Pipeline

**Status:** 🔒 BLOCKED (aguarda Track 01)  
**Phase:** 2 of 6  
**Goal:** SerpApi → raw JSON posts do LinkedIn → Supabase (`raw_posts` table)

---

## Goal
Criar o pipeline de ingestão de posts do LinkedIn via SerpApi com query booleana customizável, parsear o JSON retornado, e persistir no Supabase.

---

## Tasks (Visão Geral — detalhes na sessão de desenvolvimento)

- [ ] **T1:** Criar `app/services/serpapi_client.py` — wrapper async para SerpApi
- [ ] **T2:** Escrever testes TDD para o SerpApi client (mock da API externa)
- [ ] **T3:** Criar `app/models/raw_post.py` — Pydantic model para validar resposta SerpApi
- [ ] **T4:** Criar `app/services/ingestion_service.py` — pipeline completo: query → parse → save
- [ ] **T5:** Criar endpoint `POST /api/v1/ingest` — trigger manual da ingestão
- [ ] **T6:** Testes de integração: post ingerido aparece no Supabase
- [ ] **T7:** Implementar deduplicação por `linkedin_post_id`

---

## Query Booleana Padrão

```python
DEFAULT_QUERY = '("python") AND ("hire" OR "hiring") AND ("LATAM" OR "remote") AND ("junior" OR "senior")'
```

## SerpApi Endpoint Target
```
https://serpapi.com/search.json?engine=google&q={QUERY}&as_sitesearch=linkedin.com/posts
```

---

## Schema `raw_posts` (referência do Track 01)
Já criado no Track 01. Este track apenas insere dados.

---

## Done When
- [ ] `POST /api/v1/ingest?query=...` retorna lista de posts salvos
- [ ] Posts aparecem na tabela `raw_posts` no Supabase
- [ ] Deduplicação funciona (segundo ingest do mesmo post não duplica)
- [ ] Commit: `feat: data ingestion pipeline - SerpApi + Supabase`
