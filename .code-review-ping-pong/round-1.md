---
protocol: code-review-ping-pong
type: review
round: 1
date: "2026-04-08"
reviewer: "Codex"
commit_sha: "40b63abc8"
branch: "chore/devops-10-improvements"
based_on_fix: "null"
files_in_scope:
  - "skills/skill-stress-test/SKILL.md"
  - "skills/skill-stress-test/engine/recon.md"
  - "skills/skill-stress-test/engine/scenario-engine.md"
  - "skills/skill-stress-test/engine/output-analyzer.md"
  - "skills/skill-stress-test/engine/fixture-factory.md"
  - "skills/skill-stress-test/engine/report.md"
  - "skills/skill-stress-test/references/chaos-catalog.md"
  - "skills/skill-stress-test/references/fixture-templates.md"
score: 4
verdict: "CONTINUE"
issues:
  - id: "1.1"
    severity: "HIGH"
    title: "Schema de runtime diverge entre session.yaml, analyzer e report"
    file: "skills/skill-stress-test/engine/fixture-factory.md"
    line: "87"
    suggestion: "Padronize um único identificador de runtime, por exemplo `claude-code`, em todos os módulos e exemplos."
  - id: "1.2"
    severity: "HIGH"
    title: "Factory não materializa o fixture brownfield descrito nos templates"
    file: "skills/skill-stress-test/engine/fixture-factory.md"
    line: "45"
    suggestion: "Aplicar os overrides do brownfield ao `package.json`, criar o histórico prometido e instalar dependências quando o template exigir."
  - id: "1.3"
    severity: "HIGH"
    title: "Self-test mode depende de `Skill(...)`, incompatível com o runtime que a própria skill quer auditar"
    file: "skills/skill-stress-test/engine/scenario-engine.md"
    line: "253"
    suggestion: "Troque a dependência rígida de `Skill(...)` por um fluxo executável em ambos os runtimes ou degrade com handoff explícito e documentado."
  - id: "1.4"
    severity: "MEDIUM"
    title: "Convenção de nomes dos cenários e do next-step está inconsistente"
    file: "skills/skill-stress-test/engine/fixture-factory.md"
    line: "109"
    suggestion: "Escolha uma convenção única para IDs e arquivos, por exemplo `S-001` + `scenario-001.md`, e replique-a em todos os módulos."
  - id: "1.5"
    severity: "MEDIUM"
    title: "A skill viola o Artigo VII com vários textos pt-BR sem acentuação"
    file: "skills/skill-stress-test/SKILL.md"
    line: "137"
    suggestion: "Revisar todos os textos em português brasileiro e restaurar acentuação completa antes de publicar a skill."
  - id: "1.6"
    severity: "MEDIUM"
    title: "Recon e report usam caminhos fixos em `~/aios-core`, quebrando portabilidade"
    file: "skills/skill-stress-test/engine/recon.md"
    line: "18"
    suggestion: "Resolver o repositório a partir do diretório atual ou da localização real da skill, sem assumir o clone em `~/aios-core`."
---

# Code Ping-Pong — Round 1 Review

## 🎯 Score: 4/10 — CONTINUE

## Issues

### 🟠 HIGH

#### Issue 1.1 — Schema de runtime diverge entre session.yaml, analyzer e report
- **File:** `skills/skill-stress-test/engine/fixture-factory.md`
- **Line:** 87
- **Code:**
```yaml
totals:
  claude_code:
    pass: 0
```
- **Problem:** O estado inicial usa `claude_code`, mas o restante da skill trata o runtime como `claude-code`. Em [engine/output-analyzer.md](/Users/luizfosc/aios-core/skills/skill-stress-test/engine/output-analyzer.md#L28) o frontmatter esperado é `runtime: {claude-code|codex}` e em [engine/output-analyzer.md](/Users/luizfosc/aios-core/skills/skill-stress-test/engine/output-analyzer.md#L190) o update manda incrementar `totals.{runtime}`. Em [engine/report.md](/Users/luizfosc/aios-core/skills/skill-stress-test/engine/report.md#L26) o agrupamento é por `claude-code`, mas o exemplo de métricas volta para `claude_code`. Esse schema não fecha: a contagem do Claude Code vai cair em chave diferente ou simplesmente não bater no relatório.
- **Suggestion:**
```yaml
totals:
  claude-code:
    pass: 0
    warn: 0
    fail: 0
    critical: 0
    skipped: 0
```

#### Issue 1.2 — Factory não materializa o fixture brownfield descrito nos templates
- **File:** `skills/skill-stress-test/engine/fixture-factory.md`
- **Line:** 45
- **Code:**
```md
Load `references/fixture-templates.md` and create files based on archetype.

For each file in the template:
1. Create parent directories if needed
2. Write file contents exactly as specified in template
3. For `brownfield`: also initialize git and create commit history
```
- **Problem:** O brownfield prometido em [references/fixture-templates.md](/Users/luizfosc/aios-core/skills/skill-stress-test/references/fixture-templates.md#L146) inclui cinco commits e overrides de `package.json` com `jest`, mas o factory não diz como mesclar esses overrides ao `node-minimal` nem como instalar dependências. O resultado prático é um fixture "brownfield" que não tem o `package.json` final descrito e não consegue rodar o teste que ele mesmo anuncia. Isso distorce cenários de resume, git history e test execution logo na base.
- **Suggestion:**
```md
Para `brownfield`:
1. Gerar `node-minimal`
2. Mesclar os overrides de `package.json`
3. Rodar `npm install` para materializar `jest`
4. Criar os 5 commits na ordem documentada
```

#### Issue 1.3 — Self-test mode depende de `Skill(...)`, incompatível com o runtime que a própria skill quer auditar
- **File:** `skills/skill-stress-test/engine/scenario-engine.md`
- **Line:** 253
- **Code:**
```md
If the skill profile has `skill_type: orchestrator` or `category: orchestration`, the skill depends on the Skill tool and CANNOT be executed via bash in Terminal 2.

2. Execute the scenario in the SAME terminal using the Skill tool: `Skill(skill="{skill_name}", args="{args}")`
```
- **Problem:** Esse ramo resolve o problema de slash command assumindo a existência da ferramenta `Skill(...)`, mas a própria auditoria cross-runtime inclui Codex e já documenta gap de runtime em [references/chaos-catalog.md](/Users/luizfosc/aios-core/skills/skill-stress-test/references/chaos-catalog.md#L97). Na prática, skills orquestradoras ficam "testáveis" só em um ambiente idealizado e escapam justamente do stress test que deveria provar compatibilidade. Pior: o fluxo pula o protocolo ping-pong e altera o comportamento do teste conforme a skill, então o resultado deixa de ser comparável com os demais cenários.
- **Suggestion:**
```md
Para skills orquestradoras:
1. Emitir handoff específico por runtime
2. No Codex, usar prompt autocontido sem `Skill(...)`
3. Se não houver fallback real, marcar o cenário como incompatibilidade estrutural documentada
```

### 🟡 MEDIUM

#### Issue 1.4 — Convenção de nomes dos cenários e do next-step está inconsistente
- **File:** `skills/skill-stress-test/engine/fixture-factory.md`
- **Line:** 109
- **Code:**
```yaml
current_state: READY
next_agent: stress-test
scenario: S-001
expected_artifact: scenario-001.md
```
- **Problem:** O `next-step.md` nasce esperando `scenario-001.md`, mas o resto da skill usa `scenario-{N}.md` em [SKILL.md](/Users/luizfosc/aios-core/skills/skill-stress-test/SKILL.md#L123), [engine/scenario-engine.md](/Users/luizfosc/aios-core/skills/skill-stress-test/engine/scenario-engine.md#L202) e [engine/output-analyzer.md](/Users/luizfosc/aios-core/skills/skill-stress-test/engine/output-analyzer.md#L9). Ao mesmo tempo, o ID lógico aparece como `S-{N}` e o relatório exemplifica `S-001`. Sem uma convenção única, qualquer automação de resume ou validação de artefato vai ficar ambígua entre arquivo não padronizado e ID zero-padded.
- **Suggestion:**
```md
Padronize toda a cadeia com:
- IDs: `S-001`
- Arquivos: `scenario-001.md`, `result-001.md`, `analysis-001.md`
- Referências em todos os módulos usando o mesmo formato
```

#### Issue 1.5 — A skill viola o Artigo VII com vários textos pt-BR sem acentuação
- **File:** `skills/skill-stress-test/SKILL.md`
- **Line:** 137
- **Code:**
```md
Voce e um executor de stress test para a skill "{skill_name}".
2. Execute EXATAMENTE o que esta descrito na secao "Acao"
5. Anote qualquer comportamento inesperado
```
- **Problem:** A Constitution do projeto torna acentuação completa obrigatória para qualquer output pt-BR, mas a skill contém dezenas de ocorrências sem acento em instruções exibidas ao usuário. O problema é sistêmico e aparece também em [engine/output-analyzer.md](/Users/luizfosc/aios-core/skills/skill-stress-test/engine/output-analyzer.md#L34), [engine/report.md](/Users/luizfosc/aios-core/skills/skill-stress-test/engine/report.md#L95) e [references/chaos-catalog.md](/Users/luizfosc/aios-core/skills/skill-stress-test/references/chaos-catalog.md#L154). Isso é violação direta do Artigo VII, não mero detalhe editorial.
- **Suggestion:**
```md
Revisar todos os blocos pt-BR da skill e corrigir para formas como:
"Você", "está", "seção", "Observações", "cenário", "rápido", "ações"
```

#### Issue 1.6 — Recon e report usam caminhos fixos em `~/aios-core`, quebrando portabilidade
- **File:** `skills/skill-stress-test/engine/recon.md`
- **Line:** 18
- **Code:**
```md
Search in this order:
1. `~/aios-core/skills/{skill_name}/SKILL.md`
2. `~/aios-core/squads/{skill_name}/README.md`
```
- **Problem:** A resolução da skill e a cópia do relatório dependem de o clone estar exatamente em `~/aios-core`. Isso volta a aparecer em [engine/report.md](/Users/luizfosc/aios-core/skills/skill-stress-test/engine/report.md#L218). Em qualquer máquina com workspace em outro path, monorepo com nome diferente ou checkout temporário, a skill falha sem necessidade. Como o próprio stress test cria fixtures fora do repositório, a resolução deveria partir do projeto atual, não do diretório home hardcoded.
- **Suggestion:**
```md
Resolver o root do repositório via diretório corrente, `git rev-parse --show-toplevel` ou caminho do próprio `SKILL.md`, e derivar `skills/` e `.aios/` a partir daí.
```

## ⚠️ Regressions
- None

## ✅ What Is Good
- A escalada por tiers em [scenario-engine.md](/Users/luizfosc/aios-core/skills/skill-stress-test/engine/scenario-engine.md#L22) cobre happy path, variações, edge cases e caos de forma bem separada, o que facilita ampliar a matriz sem reescrever o fluxo.
- O catálogo em [chaos-catalog.md](/Users/luizfosc/aios-core/skills/skill-stress-test/references/chaos-catalog.md#L189) tem regras úteis de relevância e combinação de padrões, evitando cenários arbitrários demais.
- O `output-analyzer` em [output-analyzer.md](/Users/luizfosc/aios-core/skills/skill-stress-test/engine/output-analyzer.md#L53) já traz uma taxonomia prática de red flags e yellow flags, o que dá uma base boa para scoring consistente depois que o schema for corrigido.

## 📊 Summary
- Total: 6, 🔴 CRITICAL: 0, 🟠 HIGH: 3, 🟡 MEDIUM: 3, 🟢 LOW: 0
- Regressions: none
