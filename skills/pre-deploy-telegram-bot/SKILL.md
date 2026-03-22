# Pre-Deploy — Telegram Agenda Bot

Validacao completa pre-deploy do telegram-agenda-bot. Executa 8 categorias de checks e BLOQUEIA deploy se qualquer item critico falhar.

Skill ESPECIFICA para o projeto `~/CODE/Projects/telegram-agenda-bot`. Nao reutilizavel em outros projetos.

## Uso

```bash
/pre-deploy-telegram-bot
```

## Quando Usar

- Antes de QUALQUER deploy para a VPS
- Depois de mudar `.env` ou credenciais
- Depois de atualizar OAuth tokens
- Ao retomar trabalho e querer garantir que tudo funciona

## O Que Faz

Executa `npm run pre-deploy` no projeto telegram-agenda-bot, que valida:

### 1. Environment Variables (CRITICAL)
- Todas as vars obrigatorias presentes e nao-vazias
- Cross-validation: `DEFAULT_LLM_PROVIDER` tem a API key correspondente
- Vars opcionais reportadas como SKIP (nao bloqueiam)

### 2. TypeScript Build (CRITICAL)
- `tsc --noEmit` compila sem erros
- Nenhum type error no codigo

### 3. dist/ Freshness (CRITICAL)
- `dist/index.js` existe
- Nenhum arquivo `.ts` em `src/` e mais novo que `dist/`
- Se stale: BLOQUEIA ate rodar `npm run build`

### 4. Test Suite (CRITICAL)
- `vitest run tests/` passa 100%
- Roda APENAS testes do bot (exclui `.aiox-core/`)

### 5. External API Connectivity (CRITICAL/HIGH)
- **Telegram Bot API** — `getMe` valida o token
- **Gemini API** — Lista models para validar a key
- **Google OAuth** — Testa refresh do token (o que mais quebra!)
- **Google Calendar** — Lista eventos com token fresco
- **Google Drive** — Lista files com token fresco
- **OpenAI** — Valida key (para Whisper/voice)
- **OpenRouter** — Valida key (fallback LLM)
- **Dropbox** — Valida access token

### 6. Data File Integrity (HIGH)
- `data/` existe
- Todos os `.json` em `data/` sao JSON valido (detecta corrupcao)

### 7. PM2 Configuration (HIGH)
- `ecosystem.config.cjs` existe (nao `.js` — ES module compat)
- Fork mode configurado (Telegram API limitation)
- Script aponta para `dist/`

### 8. Critical Files (CRITICAL)
- `node_modules/` instalado
- `package-lock.json` presente
- `.env` existe
- `tsconfig.json` presente

## Veredicto

| Resultado | Significado |
|-----------|-------------|
| **DEPLOY: GO** | Todos os checks criticos passam. Deploy seguro. |
| **DEPLOY: BLOCKED** | Check(s) critico(s) falhando. Fix obrigatorio. |

## Licoes que Este Script Previne

Baseado no historico REAL de bugs em producao:

| Bug | Data | Como o Script Previne |
|-----|------|-----------------------|
| `.env` com key vazia | 17 Mar | Check 1: vars > 5 chars |
| OAuth token expirado | 17 Mar | Check 5: testa refresh real |
| `dist/` desatualizado | 18 Mar | Check 3: compara timestamps |
| PM2 cluster mode | 16 Mar | Check 7: valida fork mode |
| `.cjs` extension | 16 Mar | Check 7: valida extensao |
| Gemini model morto | 17 Mar | Check 5: testa API real |
| Tests falhando | Varios | Check 4: roda suite completa |

## Execution

```yaml
command: npm run pre-deploy
cwd: ~/CODE/Projects/telegram-agenda-bot
exit_code_0: DEPLOY GO
exit_code_1: DEPLOY BLOCKED
timeout: 120s
```

## Instructions

When this skill is invoked:

1. Navigate to the telegram-agenda-bot project directory
2. Run `npm run pre-deploy`
3. Wait for all 8 checks to complete
4. If DEPLOY: BLOCKED, help user fix each critical failure
5. If DEPLOY: GO, confirm safe to proceed

DO NOT skip any check. DO NOT deploy if blocked.
