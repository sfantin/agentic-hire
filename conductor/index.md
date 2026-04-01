# Conductor — AgenticHire

> Navigation hub for project context. Start here every session.

## Quick Links

| Doc | Conteúdo |
|---|---|
| [product.md](product.md) | Nome, problema, usuários, objetivos |
| [product-guidelines.md](product-guidelines.md) | Tom, design principles, brand |
| [tech-stack.md](tech-stack.md) | Stack completa com rationale de cada escolha |
| [workflow.md](workflow.md) | TDD, commits, fases, checkpoints, roles |
| [tracks.md](tracks.md) | Registro de todos os 6 tracks de desenvolvimento |

## Active Track

🟢 **[Track 01 — Backend Foundation](tracks/track-01-backend-foundation.md)**

```
FastAPI + Supabase + Health Check
10 tasks | TDD strict | Meta: pytest 100% + curl /health = 200
```

## All Tracks

```
Track 01 ← ACTIVE NOW
Track 02 ← blocked by 01 (Data Ingestion)
Track 03 ← blocked by 02 (Qualification Agent)
Track 04 ← blocked by 03 (Cold Outreach + Gap Analysis)
Track 05 ← blocked by 04 (React Dashboard)
Track 06 ← blocked by 05 (Polish + Deploy)
```

## How to Start a Session

```bash
# No terminal do Claude Code — sempre começar assim:
"Read agents.md first. Then read conductor/index.md.
 Then read conductor/tracks/track-01-backend-foundation.md.
 Tell me which task we're on and ask what to do next."
```

## Project Context (agents.md)

O arquivo `agents.md` na raiz do projeto contém todo o contexto técnico e regras de desenvolvimento. **Sempre lido antes de qualquer sessão.**
