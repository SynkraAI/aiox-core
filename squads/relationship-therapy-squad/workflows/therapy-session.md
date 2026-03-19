---
workflow: Sessão de Terapia de Relacionamento
responsavel: "@lead-therapist"
trigger: "*consult ou *session"
steps:
  - agent: "@lead-therapist"
    task: consult
    description: "Sofia acolhe, ouve e faz triagem"
  - agent: "@lead-therapist"
    task: triage
    description: "Identifica especialista(s) mais adequado(s)"
  - agent: "{especialista-primario}"
    task: session
    description: "Especialista aplica seus frameworks e dá recomendações"
  - agent: "{especialista-secundario}"
    task: session
    description: "Segundo especialista complementa (se necessário)"
    condition: "quando múltiplos temas identificados na triagem"
  - agent: "@lead-therapist"
    task: session
    description: "Sofia integra insights e cria plano de ação"
    depends_on: [especialista-primario, especialista-secundario]
---

# Sessão de Terapia de Relacionamento

Workflow completo para uma consulta terapêutica com o squad de relacionamentos.

## Flow

```
Paciente
   │
   ▼
┌──────────────────┐
│  Sofia (Triagem)  │ ← Acolhe, ouve, identifica tema
│  @lead-therapist  │
└────────┬─────────┘
         │
         ├─── Conflito/Comunicação ──→ @gottman + @rosenberg
         ├─── Apego/Ansiedade ──────→ @amir-levine + @sue-johnson
         ├─── Desconexão Emocional ─→ @sue-johnson + @brene-brown
         ├─── Desejo/Infidelidade ──→ @esther-perel + @emily-nagoski
         ├─── Toxicidade/Narcisismo → @dr-ramani + @terry-real
         ├─── Vergonha/Vulnerab. ──→ @brene-brown + @sue-johnson
         ├─── Trauma/Ansiedade ────→ @deb-dana + @brene-brown
         ├─── Sexualidade ─────────→ @emily-nagoski + @esther-perel
         ├─── Masculinidade ───────→ @terry-real + @gottman
         └─── Comunicação/Pedidos ─→ @rosenberg + @gottman
                  │
                  ▼
         ┌───────────────────┐
         │   Especialista(s)  │ ← Aplica frameworks, diagnostica, recomenda
         └────────┬──────────┘
                  │
                  ▼
         ┌───────────────────┐
         │  Sofia (Integração)│ ← Resume, conecta perspectivas, plano de ação
         │  @lead-therapist   │
         └───────────────────┘
                  │
                  ▼
           Plano de Ação
         + Exercícios Práticos
         + Leituras Recomendadas
```

## Regras de Execução

1. **Acolhimento primeiro** — Nunca pular para diagnóstico sem validar sentimentos
2. **Máximo 3 especialistas** por sessão para não sobrecarregar
3. **Sofia sempre integra** — Paciente nunca fica com perspectivas desconectadas
4. **Paciente escolhe** — Pode pedir especialista específico a qualquer momento
5. **Segurança prioritária** — Se detectar risco, @dr-ramani é chamada imediatamente
6. **Idioma** — Toda comunicação em português (pt-BR) por padrão

## Error Handling

| Situação | Ação |
|---|---|
| Paciente em crise aguda | @deb-dana (regulação) → depois especialista |
| Risco de segurança física | @dr-ramani imediatamente |
| Queixa muito vaga | Sofia faz perguntas clarificadoras antes de triar |
| Paciente quer falar com todos | Sessão completa (*session) com sequência |
| Paciente discorda do especialista | Sofia oferece alternativa ou acesso direto via *call |
