# Epic 184: Kimi K2.5 Provider Support

## Metadata

| Campo | Valor |
|-------|-------|
| Epic ID | 184 |
| Status | Draft |
| Source Issue | #184 |
| Issue URL | https://github.com/SynkraAI/aiox-core/issues/184 |
| Repository | SynkraAI/aiox-core |
| Priority | P4 |
| Area | Core runtime, AI providers, LLM routing |

## Objetivo

Adicionar suporte nativo e backward-compatible para Kimi K2.5 da Moonshot AI como provider OpenAI-compatible no `aiox-core`, permitindo uso via Moonshot API ou endpoints compatíveis sem quebrar os providers existentes `claude` e `gemini`.

## Code Reality

- `.aiox-core/infrastructure/integrations/ai-providers/ai-provider.js` define a interface base `AIProvider` para execução, retry, status e metadata.
- `.aiox-core/infrastructure/integrations/ai-providers/ai-provider-factory.js` registra apenas `claude` e `gemini`, carrega `.aiox-ai-config.yaml`, mantém cache de providers e possui listas hardcoded em `getAvailableProviders()` e `getProvidersStatus()`.
- `ClaudeProvider` e `GeminiProvider` são wrappers de CLI; Kimi K2.5 deve ser HTTP/OpenAI-compatible, não wrapper de CLI.
- `docs/guides/llm-routing.md` já cobre roteamento Claude Code para DeepSeek via endpoint Anthropic-compatible, mas isso é diferente de provider nativo no factory de `AIProvider`.
- Existe uma worktree antiga `feat/kimi-ide-integration-20260507`, porém seu escopo é Kimi como target de IDE sync (`.kimi/skills` e transformer), não o provider LLM solicitado no issue #184.
- A documentação oficial da Kimi API declara compatibilidade com o formato OpenAI e usa `https://api.moonshot.ai/v1` como `base_url`; com esse `base_url`, o endpoint relativo de chat é `/chat/completions`.

## Escopo

- Criar um provider HTTP genérico `OpenAICompatibleProvider` reaproveitável para Kimi e outros endpoints compatíveis.
- Registrar aliases `openai-compatible` e `kimi` no factory, com preset seguro para Moonshot/Kimi.
- Permitir configuração por `.aiox-ai-config.yaml` e variáveis de ambiente, sem registrar segredos em logs ou docs.
- Garantir que `claude` e `gemini` continuem sendo o default e o fallback atuais.
- Documentar uso de Kimi K2.5 e OpenRouter/Moonshot como configuração, não como dependência obrigatória.

## Fora de Escopo

- Fazer chamadas reais para Moonshot, OpenRouter ou qualquer provider externo nos testes.
- Migrar toda a estratégia de LLM routing do Claude Code.
- Incorporar ou mergear a branch de Kimi IDE sync nesta story.
- Prometer tool calling perfeito para todos os endpoints OpenAI-compatible sem testes de contrato por provider.
- Armazenar API keys no repositório.

## Stories

| Story | Título | Status | Prioridade | Ordem |
|-------|--------|--------|------------|-------|
| 184.1 | OpenAI-Compatible Kimi Provider Contract | Draft | P4 | 1 |

## Ordem de Execução

### Sequencial

1. Validar `STORY-184.1-OPENAI-COMPATIBLE-KIMI-PROVIDER.md` com PO/architect para confirmar que o escopo é provider LLM, não IDE sync.
2. Implementar `OpenAICompatibleProvider` com testes unitários sem rede.
3. Registrar aliases `openai-compatible` e `kimi` no provider factory e remover hardcodes de listas onde necessário.
4. Atualizar docs e exemplos de `.aiox-ai-config.yaml`.
5. Rodar validações focadas e publicar PR.

### Paralelizável

- Documentação de uso pode ser preparada em paralelo aos testes depois que o contrato de configuração estiver definido.
- Expansão futura para a branch de Kimi IDE sync deve rodar em outro ciclo, depois do provider LLM estar validado.

## Validation Gates

- `npm test -- --runTestsByPath tests/infrastructure/ai-providers/ai-provider-factory.test.js`
- Novo teste focado para `OpenAICompatibleProvider`, com `fetch` mockado e sem chamadas de rede.
- `npm run lint`
- `npm run typecheck`
- `npm run validate:manifest`, se novos arquivos entrarem no pacote instalável.

## Referências

- Issue #184: https://github.com/SynkraAI/aiox-core/issues/184
- Kimi API overview: https://platform.kimi.ai/docs/api/overview
- Kimi chat completions endpoint: https://platform.kimi.ai/docs/api/chat
- Kimi K2.5 quickstart: https://platform.moonshot.ai/docs/guide/kimi-k2-5-quickstart
