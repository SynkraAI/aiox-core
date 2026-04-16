---
description: [AIOS] Executar revisão de Qualidade (QA) em uma Story recém-finalizada
turbo: all
---
# AIOS: QA Evolution Workflow

Este é o fluxo "Epic 6" portado localmente para forçar a Qualidade Agêntica em uma Story dita como pronta pelo Dev.

## Validação e Quality Assurance

1. **Assimilando QA**: Compreenda os Acceptance Criteria listados na Story. Você deve assumir a postura estrita de *Quality Assurance Software Engineer*.
2. **Revisão Estática (Diffs)**: Avalie as mudanças recentes de código relacionadas à Story. Verifique se o código possui vazamento de tipagem imperfeito, console statements esquecidos ou anti-patterns.
3. **Testes Nativos**: Se a linguagem/framework da spec suportar, realize uma passagem de testes locais (`npm test`, `pytest`, etc.) ou rodadas de Linter.
4. **Parecer de Qualidade**: 
   - Se 100% OK: Anote "QA Review PASS" na Story e marque-a como \`DONE\`.
   - Se Erros Encontrados: Gere um log claro e envie de volta ao Desenvolvedor (sugira melhorias explícitas no código).
