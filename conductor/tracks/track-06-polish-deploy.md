# Track 06 — Polish, Deploy & README

**Status:** 🔒 BLOCKED (aguarda Track 05)  
**Phase:** 6 of 6  
**Goal:** Sistema em produção, observabilidade básica, README que impressiona CTOs

---

## Goal
Polir erros, adicionar logging estruturado, fazer deploy no Railway (backend) + Vercel (frontend), e escrever README de nível sênior.

---

## Tasks

### Observability
- [ ] Adicionar `loguru` para logging estruturado no FastAPI
- [ ] Log de cada request + tempo de resposta
- [ ] Log de cada chamada ao Groq (tokens usados, latência)
- [ ] Sentry para captura de erros em produção

### Error Handling
- [ ] Custom exception handlers no FastAPI
- [ ] Resposta padronizada para erros: `{"error": "code", "message": "...", "detail": {}}`
- [ ] Graceful degradation: se Groq falha, retornar erro estruturado (não 500 genérico)

### Deploy
- [ ] Criar `Dockerfile` para o backend FastAPI
- [ ] Deploy backend no Railway via GitHub
- [ ] Deploy frontend no Vercel via GitHub
- [ ] Configurar variáveis de ambiente em produção
- [ ] Health check endpoint validado em produção

### README (nível sênior)
- [ ] Arquitetura do sistema com diagrama ASCII/Mermaid
- [ ] Como rodar localmente (passo a passo)
- [ ] Decisões de design e trade-offs documentados
- [ ] Stack justificada tecnicamente
- [ ] Screenshots do dashboard
- [ ] Vídeo demo de 2 minutos (link)

---

## README Structure

```markdown
# AgenticHire — AI Job Qualification System

> "I do not build demos — I architect agentic systems that scale."

## Architecture
[Diagrama do pipeline completo]

## Why This Stack?
- FastAPI: async-native, produção-grade
- Groq/Llama3: velocidade de inferência, custo zero
- SerpApi: elimina problema de anti-bot do LinkedIn
- LinkedIn Posts (não Jobs tab): vantagem competitiva

## Trade-offs Considered
- CrewAI vs Custom Pipeline → escolhemos pipeline sequencial para MVP (KISS)
- Claude vs Llama3 → Llama3 via Groq é 10x mais rápido e gratuito para portfólio
- SQLAlchemy vs supabase-py → supabase-py reduz overhead para MVP

## Running Locally
[passo a passo]

## API Documentation
[link para /docs]
```

---

## Done When
- [ ] Backend em produção no Railway respondendo `/health` com 200
- [ ] Frontend em produção no Vercel
- [ ] README impressionante no GitHub
- [ ] Post no LinkedIn com demo de 2 minutos
- [ ] Commit final: `docs: production-ready README + architecture documentation`
