# Product Guidelines — AgenticHire

## Voice & Tone

**"Business-Driven Engineering"** — tom duplo estratégico:

### Interface (UI/UX)
- **Estratégica e executiva** — linguagem de decisão rápida
- Sem jargões técnicos desnecessários na interface
- Dados em foco: Match Score, Gap Analysis, ações claras ("Approve", "Generate Outreach")
- Parece um **SaaS B2B de produção**, não um projeto acadêmico
- Exemplos: "87% fit — Strong architecture match, missing Kubernetes" em vez de "O LLM retornou score 87"

### Documentação (README, GitHub, ADRs)
- **Técnica e densa em engenharia de produção**
- Detalhar: arquitetura, trade-offs de design, estratégias de fallback, métricas de custo/latência
- Usar terminologia precisa: async patterns, Pydantic validation, retry logic, structured outputs
- Demonstrar o raciocínio de Arquiteto: "Escolhemos Groq + Llama3 sobre Claude API porque..."

## Design Principles

1. **Data-first** — cada elemento da interface serve os dados; decisões baseadas em dados, não intuição visual
2. **Reliability over features** — sistema que falha graciosamente é melhor que sistema com mais features que quebra
3. **Strategic UX** — cada elemento da tela tem propósito de negócio claro; nada é decorativo sem função

## UI Standards

- Dashboard principal: dark mode, profissional, clean
- Match Score: badge visual com cor (verde ≥ 85, amarelo 60-84, vermelho < 60)
- Filtros: query booleana editável, persistida no estado da sessão
- Vagas ordenadas por: score DESC, data DESC (padrão)
- Gap Analysis: gráfico de barras com top skills faltando (frequência × %)

## Brand Positioning
> "I do not build demos — I architect agentic systems that scale."

Este projeto é prova viva desta afirmação. Cada decisão técnica deve ser documentada como evidência de senioridade.
