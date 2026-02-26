# CODEX Critical Analysis — Epic INS-4

## 1. Veredito Executivo

**GO com condicoes.**

O epic e viavel, mas o escopo atual mistura itens ja parcialmente implementados com lacunas estruturais nao explicitadas no plano. Sem ajuste de ordem/sizing e sem reforco de testes de regressao, o risco de regressao no installer e alto.

## 2. Achados por Severidade

### CRITICO

1. **INS-4.2 continua bloqueador real: nao existe gerador de `settings.json` de boundary.**
- Evidencia: inexistencia de gerador dedicado (`generate-settings-json.js`) no installer (`packages/installer/src/wizard/generate-settings-json.js`, `packages/installer/src/installer/generate-settings-json.js` inexistentes).
- O wizard atual apenas escreve `language` em `.claude/settings.json` (`packages/installer/src/wizard/index.js:120`, `packages/installer/src/wizard/index.js:131`, `packages/installer/src/wizard/index.js:506`), sem gerar `permissions.deny/allow`.
- Impacto: fresh install/upgrades podem sair sem enforcement de boundary consistente.

2. **Hooks git de qualidade nao sao garantidos no fluxo `npx aios-core install`.**
- Evidencia: `package.json` usa `"prepare": "husky"` (`package.json:66`) e nao ha wiring de `.husky`/`husky install` no installer (`packages/installer/src` sem referencias a husky/pre-commit/pre-push).
- Impacto: em cenarios sem `npm install` local, hooks podem nao ser instalados, invalidando parte do controle de qualidade proposto no epic.

3. **INS-4.7 subestimado: merge YAML ainda nao existe no merger.**
- Evidencia: merger suporta `.env` e `.md` apenas (`packages/installer/src/merger/strategies/index.js:16`, `packages/installer/src/merger/strategies/index.js:21`, `packages/installer/src/merger/strategies/index.js:24`), sem strategy YAML.
- Impacto: “smart merge de `core-config.yaml`” exige nova strategy + testes + compatibilidade com migracao/override.

### ALTO

1. **INS-4.6 esta parcialmente duplicada com implementacao ja existente.**
- Evidencia: hook pre-push ja chama sync incremental (`.husky/pre-push:5`, `.aios-core/hooks/ids-pre-push.js:108`) e `RegistryUpdater.processChanges` processa mudancas incrementais (`.aios-core/core/ids/registry-updater.js:139`).
- Impacto: risco de story redundante se escopo nao for reduzido para bootstrap/health/sanity somente.

2. **INS-4.3 tambem ja tem parte implementada (rules/hooks/settings.local).**
- Evidencia: copia de `.claude/rules` (`packages/installer/src/wizard/ide-config-generator.js:286`, `packages/installer/src/wizard/ide-config-generator.js:530`), copia de hooks (`packages/installer/src/wizard/ide-config-generator.js:541`, `packages/installer/src/wizard/ide-config-generator.js:661`) e criacao de `.claude/settings.local.json` (`packages/installer/src/wizard/ide-config-generator.js:550`, `packages/installer/src/wizard/ide-config-generator.js:711`).
- Impacto: risco de retrabalho/superestimacao se story nao focar no gap residual (`settings.json` boundary).

3. **INS-4.1 tem desalinhamento funcional no `doctor` atual.**
- Evidencia: `runDoctor` implementa checks basicos (Node/npm/Git/install/Pro) (`bin/aios.js:394`, `bin/aios.js:412`, `bin/aios.js:427`, `bin/aios.js:441`, `bin/aios.js:491`) e usa `PostInstallValidator` internamente (`bin/aios.js:449`).
- Help descreve checks mais amplos nao condizentes (`bin/aios.js:677`).
- `doctorOptions` e montado no dispatch (`bin/aios.js:1094`) mas `runDoctor` ignora parametro e le `args` global (`bin/aios.js:351`), sugerindo bug de contrato e fragilidade de flags.

4. **Cobertura de testes insuficiente nos pontos mais arriscados do epic.**
- Evidencia: ha testes de detection/env/merger (`packages/installer/tests/integration/wizard-detection.test.js:16`, `packages/installer/tests/unit/merger/strategies.test.js:17`), mas nao aparecem suites focadas em `post-install-validator`, `brownfield-upgrader`, `doctor`, ou integracao installer↔ide-sync.
- Impacto: alto risco de regressao silenciosa em install/upgrade.

### MEDIO

1. **Migracao de config pode perder semantica de boundary.**
- Evidencia: migrador move apenas campos limitados (`PROJECT_FIELDS`) e nao inclui `boundary` (`.aios-core/core/config/migrate-config.js:36`).
- Impacto: inconsistencias em projetos migrados para config em camadas, se INS-4.7 depender de migracao.

2. **INS-4.5 e viavel tecnicamente, mas precisa definir contrato de API (nao CLI shell).**
- Evidencia: `ide-sync` exporta funcoes programaticas (`.aios-core/infrastructure/scripts/ide-sync/index.js:534`), inclusive `commandSync`/`commandValidate`.
- Impacto: baixo/medio; risco principal e acoplamento de cwd/side effects se integrar sem adapter.

3. **INS-4.8 pode colidir semanticamente com `doctor` existente se nomenclatura nao for clarificada.**
- Evidencia: ja existe engine de health-check (`.aios-core/core/health-check/index.js`) e task `health-check` com alias `*doctor` (`.aios-core/development/tasks/health-check.yaml:21`).
- Impacto: confusao de UX e duplicacao de mecanismos de diagnostico.

## 3. Respostas Diretas (Secao 5 do Handoff)

1. **Sizing 24 pontos e realista?**
- **Nao, na forma atual.** Recomendo **27-31 pontos** apos ajuste de escopo: reduzir stories redundantes (INS-4.3/4.6) e aumentar effort de INS-4.2/4.7 + testes.

2. **Ha gaps nao encontrados?**
- Sim:
- instalacao de hooks husky nao garantida no install por `npx` (sem `npm install`).
- bug de contrato em `runDoctor(options)` vs implementacao real.
- falta de plano de testes de regressao para validator/upgrader/doctor.

3. **As 3 waves fazem sentido?**
- Sim, mas a ordem deve mudar:
- **Wave 1 (fundacao):** INS-4.2 + INS-4.7 + story adicional de hooks/husky.
- **Wave 2 (integracao):** INS-4.3 + INS-4.5 + INS-4.6 (reescopada).
- **Wave 3 (diagnostico/doc):** INS-4.1 + INS-4.4 + INS-4.8.

4. **INS-4.1 e INS-4.2 sao independentes?**
- **Nao totalmente.** `doctor` fica mais confiavel apos existir `settings.json` generator, pois varios checks dependem desse artefato existir e ser idempotente.

5. **INS-4.7 fase 1 (add new keys) cabe em 3 pontos?**
- **Nao.** Com strategy YAML nova + preservacao de custom + testes + compatibilidade, estimativa realista: **5-6 pontos**.

6. **Epic precisa de stories adicionais?**
- Sim, pelo menos:
- **INS-4.9:** installer/hook bootstrapping (`husky install`/fallback cross-platform).
- **INS-4.10:** regression test matrix para doctor + upgrader + validator + IDE sync integration.

7. **Ha dead code/modulos abandonados?**
- Ha legado ativo por fallback (`bin/aios.js:27` cai para `bin/aios-init.js`), e `aios-init.js` ainda mantem comportamento proprio de setup/hook global. Nao e dead code puro, mas e fonte de divergencia e deve entrar no plano de convergencia.

8. **Viavel com `frameworkProtection: false` e `true`?**
- Sim, se INS-4.2 tratar explicitamente ambos modos:
- `true`: gera deny/allow completos.
- `false`: gera settings sem deny de boundary (ou com bloqueios minimos), preservando execucao do installer sem bloquear contribuidores.

## 4. Ajustes Recomendados por Story

- **INS-4.1 (`aios doctor`)**
  - Reusar `PostInstallValidator` como subcomponente oficial (ja ocorre parcialmente), corrigir assinatura/flags e alinhar help com checks reais.
  - **Sizing recomendado:** 4-5 pts.

- **INS-4.2 (`settings.json` generator)**
  - Criar gerador deterministico a partir de `boundary.protected/exceptions` + expansao de regras granulares de `core/*`.
  - Incluir modo idempotente e preservacao de secoes nao-geradas.
  - **Sizing recomendado:** 5-6 pts.

- **INS-4.3 (installer settings + rules)**
  - Reescopar para wiring do gerador INS-4.2 no wizard e validacao pos-install; manter copia de rules/hooks como “ja entregue”.
  - **Sizing recomendado:** 1-2 pts.

- **INS-4.4 (CLAUDE.md template v5)**
  - Reusar `markdown-merger` com marcadores FRAMEWORK-OWNED/PROJECT-CUSTOMIZED.
  - **Sizing recomendado:** 2-3 pts.

- **INS-4.5 (IDE sync integration)**
  - Integrar via API exportada (`commandSync`) e nao via shell; adicionar smoke test.
  - **Sizing recomendado:** 2-3 pts.

- **INS-4.6 (entity registry on install)**
  - Reescopar para bootstrap/sanity no install; incremental ja existe no pre-push.
  - Evitar threshold fixo `>=500` (usar limite relativo por tipo de projeto).
  - **Sizing recomendado:** 1-2 pts.

- **INS-4.7 (config smart merge)**
  - Implementar `yaml-merger.js` + estrategia “add new keys only” (fase 1) + testes.
  - Integrar com `brownfield-upgrader` (detecao user-modified por hash).
  - **Sizing recomendado:** 5-6 pts.

- **INS-4.8 (health-check task)**
  - Unificar narrativa com `core/health-check` e alias `*doctor` para evitar duplicidade.
  - **Sizing recomendado:** 2 pts.

## 5. Gaps Nao Identificados (Adicionais)

1. Ausencia de garantia de instalacao de hooks git no caminho `npx aios-core install`.
2. Divergencia de comportamento entre wizard novo e fallback `aios-init.js`.
3. Ausencia de matriz de regressao para fluxos de upgrade com arquivos customizados.
4. Falta de contrato formal de ownership em `.claude/settings.json` (bloco gerado vs bloco manual).

## 6. Riscos Adicionais e Mitigacao

- **Risco:** regressao em brownfield ao mesclar YAML.
  - **Mitigacao:** modo preview + backup automatico + rollout por feature-flag.

- **Risco:** quebrar customizacoes manuais de settings.
  - **Mitigacao:** delimitadores de secao gerada e merge seletivo.

- **Risco:** aumento de tempo de install por checks pesados.
  - **Mitigacao:** quick checks sincronos e full checks assinc/opt-in.

- **Risco:** inconsistencias entre docs e comportamento real.
  - **Mitigacao:** atualizar help/output do `doctor` e adicionar testes de CLI contract.

