# Workflow — AgenticHire

## Development Philosophy
> "Você vai usar o Claude Code não como uma máquina de desejos, mas como um desenvolvedor júnior muito rápido sob a sua gerência."

## Roles
- **Sérgio** = Senior AI Systems Architect (dirige, aprova, valida)
- **Claude Code / IA** = Junior Developer (implementa, testa, documenta)

## TDD Policy: **Strict**
1. Escrever teste com input/output esperado **antes** da função
2. Confirmar que o teste **falha** (RED)
3. Escrever o código mínimo para o teste passar (GREEN)
4. Refatorar mantendo os testes passando (REFACTOR)
5. **Jamais** modificar os testes para fazer o código passar

## Commit Strategy: Conventional Commits
```
feat: adiciona Qualification Agent com Pydantic validation
fix: corrige retry logic no Groq client
test: adiciona testes para pipeline de ingestão SerpApi
docs: atualiza README com arquitetura do sistema
chore: adiciona .env.example e .gitignore
```

## Code Review Policy
- Self-review OK para MVP
- Checklist antes de cada commit:
  - [ ] Testes passando
  - [ ] Nenhuma chave de API hardcoded
  - [ ] Sem prints de debug no código final
  - [ ] Async onde necessário
  - [ ] Pydantic validando outputs do LLM

## Verification Checkpoints
Verificação **obrigatória após cada fase**:
- Phase 1: FastAPI rodando + Supabase conectado (health check endpoint retorna 200)
- Phase 2: Post ingerido via SerpApi aparece no Supabase
- Phase 3: Qualification Agent retorna JSON válido com Pydantic para 5 posts de teste
- Phase 4: Cold outreach email gerado para post com score ≥ 85
- Phase 5: Dashboard exibe vagas ordenadas por score com filtros funcionais
- Phase 6: README documenta arquitetura com todos os trade-offs

## Task Lifecycle
```
[TODO] → [IN PROGRESS] → [TESTING] → [DONE]
```

## Context Management (Claude Code)
- Usar `clear` entre tarefas para resetar contexto
- Sempre começar nova sessão com: "Read agents.md first"
- Construir em módulos pequenos — nunca pedir o app inteiro de uma vez
- Gravar commits após cada módulo funcional

## Development Phases

| Phase | Focus | Deliverable |
|---|---|---|
| 1 | Backend Foundation | FastAPI + Supabase + health check |
| 2 | Data Ingestion | SerpApi → raw_posts no Supabase |
| 3 | AI Intelligence | Qualification Agent (Groq + Pydantic) |
| 4 | Extended Agents | Cold Outreach + Gap Analysis |
| 5 | Frontend | React dashboard com filtros + scores |
| 6 | Polish | Observability + README + deploy |
