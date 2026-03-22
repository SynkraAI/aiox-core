# Deep Research Prompt Template

> Gerado automaticamente pela skill /tech-research

---

## Prompt para Deep Research

```
TÓPICO: "{{TOPIC}}"

CONTEXTO: {{CONTEXT}}

ESCOPO:
1. IMPLEMENTAÇÕES EXISTENTES: O que já existe? Repositórios, bibliotecas, soluções publicadas.
2. TÉCNICAS E PADRÕES: Métodos comprovados, best practices, patterns reconhecidos.
3. COMPARATIVOS: Alternativas, trade-offs, quando usar cada abordagem.
4. RISCOS E LIMITAÇÕES: O que pode dar errado? Edge cases, gotchas.
5. MÉTRICAS E BENCHMARKS: Como medir sucesso? Números de referência.

REQUISITOS:
{{REQUIREMENTS}}

FONTES A PESQUISAR:
- GitHub: issues, repos, gists, discussions
- Blogs técnicos: dev.to, medium, pessoais de especialistas
- Documentação oficial das tecnologias envolvidas
- Stack Overflow e fóruns técnicos
- Papers acadêmicos (se aplicável)

RESULTADOS ESPERADOS:
1. Lista de soluções/técnicas rankeadas por {{RANKING_CRITERIA}}
2. Código de referência funcional (se aplicável)
3. Framework de decisão: quando usar o quê
4. Próximos passos práticos com priorização
5. Referências e fontes para aprofundamento
```

---

## Variáveis

| Variável | Descrição |
|----------|-----------|
| `{{TOPIC}}` | Tópico refinado em formato de título estratégico |
| `{{CONTEXT}}` | Descrição do propósito e objetivos práticos |
| `{{REQUIREMENTS}}` | Lista de requisitos específicos (performance, compatibilidade, etc.) |
| `{{RANKING_CRITERIA}}` | Critério principal para rankeamento (efetividade, simplicidade, etc.) |
