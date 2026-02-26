# Mini-Design: Condições Pré-Implementação NOG-15

**De:** @architect (Aria)
**Para:** Story de implementação (NOG-15 ou equivalente)
**Data:** 2026-02-21
**Origem:** Codex QA Review — `HANDOFF-CODEX-QA-REVIEW-NOG-11.md`
**Status:** Checklist de entrada obrigatório

---

## Contexto

O Codex QA revisou o handoff NOG-11 e emitiu **GO condicionado** com 5 condições objetivas que devem ser resolvidas antes (ou como parte de) a story de implementação. Este documento resolve cada condição com design concreto.

---

## C1: Evitar Double Increment de `prompt_count`

### Problema

`updateSession()` em `session-manager.js:224` **sempre** incrementa `prompt_count`:

```js
// session-manager.js:223-225
session.prompt_count += 1;
session.last_activity = new Date().toISOString();
```

Se o Stop hook chamar `updateSession()` para persistir métricas de token, e o UserPromptSubmit hook também chamar (QW-1), haverá **2 increments por turno**.

### Solução: `updateSessionMetrics()`

Criar função separada que atualiza campos de métricas **sem** incrementar `prompt_count`:

```js
/**
 * Update session metrics without incrementing prompt_count.
 * Used by Stop hook to persist token usage data between turns.
 *
 * @param {string} sessionId
 * @param {string} sessionsDir
 * @param {object} metrics - Fields to merge into session.context
 * @returns {object|null} Updated session
 */
function updateSessionMetrics(sessionId, sessionsDir, metrics) {
  const session = loadSession(sessionId, sessionsDir);
  if (!session) return null;

  // Merge metrics into context only — no prompt_count increment
  if (!session.context) session.context = {};
  Object.assign(session.context, metrics);

  session.last_activity = new Date().toISOString();

  const filePath = resolveSessionFile(sessionId, sessionsDir);
  try {
    fs.writeFileSync(filePath, JSON.stringify(session, null, 2), 'utf8');
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      console.error(`[synapse:session] Error: Permission denied writing session ${sessionId}`);
      return null;
    }
    throw error;
  }
  return session;
}
```

### Validação

- Teste unitário: chamar `updateSession()` 1x + `updateSessionMetrics()` 1x → `prompt_count` deve ser 1 (não 2)
- Teste: `updateSessionMetrics()` deve persistir `context.last_tokens_used` corretamente
- Teste: `updateSessionMetrics()` sem sessão existente → retorna null

### Alternativa Descartada

Adicionar flag `{ incrementPrompt: false }` a `updateSession()` — rejeitada porque muda a interface de um método existente com 4+ call sites, violando o princípio de menor surpresa.

---

## C2: Path Oficial para Registrar o Stop Hook

### Problema

O handoff referenciava `.claude/settings.json`, que **não existe** neste repo. O arquivo real é `.claude/settings.local.json`.

### Solução

Registrar o Stop hook em `.claude/settings.local.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/synapse-token-collector.cjs"
          }
        ]
      }
    ]
  }
}
```

### Nota de Sync

O `.claude/settings.local.json` é gitignored (settings locais). Para distribuição:
- O hook script `.claude/hooks/synapse-token-collector.cjs` é commitado
- A configuração de settings é documentada no README/install guide
- O `npx aios-core install` deve registrar o hook automaticamente (future enhancement)

### Validação

- Verificar que o Stop hook é invocado após Claude responder (log de teste)
- Verificar que `transcript_path` é recebido no stdin do hook

---

## C3: Tail Read Adaptativo com Fallback

### Problema

Buffer fixo de 50KB pode não conter a última mensagem assistant em casos extremos (tool outputs muito grandes no final da sessão).

### Solução: Buffer Progressivo

```js
const BUFFER_SIZES = [50 * 1024, 100 * 1024, 200 * 1024]; // 50KB, 100KB, 200KB

function tailReadUsage(filePath) {
  const stats = fs.statSync(filePath);

  for (const bufferSize of BUFFER_SIZES) {
    const start = Math.max(0, stats.size - bufferSize);
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(Math.min(bufferSize, stats.size - start));
    fs.readSync(fd, buffer, 0, buffer.length, start);
    fs.closeSync(fd);

    const content = buffer.toString('utf8');
    const lines = content.split('\n').reverse();

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        if (entry.type === 'assistant' && entry.message?.usage) {
          return entry.message.usage;
        }
      } catch { continue; } // Partial first line expected
    }

    // If buffer too small (no assistant message found), try next size
  }

  // All buffer sizes exhausted — fallback to estimation
  return null;
}
```

### Comportamento

| Tentativa | Buffer | Latência Esperada | Cenário |
|-----------|--------|-------------------|---------|
| 1 | 50KB | ~0.2ms | >99% dos casos |
| 2 | 100KB | ~0.4ms | Tool output grande no final |
| 3 | 200KB | ~0.8ms | Caso extremo |
| Fallback | N/A | 0ms | Retorna null → estimação usada |

### Validação

- Teste com JSONL artificial: last assistant a 60KB do final → buffer 1 falha, buffer 2 encontra
- Teste com JSONL vazio → retorna null
- Teste com JSONL corrompido → retorna null (graceful)

---

## C4: Validação Empírica de `effective_context`

### Problema

A fórmula `effective_context = input_tokens + cache_read_input_tokens` precisa de validação empírica além das 2 sessões iniciais.

### Plano de Validação

**Critério de aceite:** `effective_context` calculado deve estar dentro de **5% do context window real** reportado pela API em pelo menos 5 sessões distintas.

### Método

1. Coletar dados de 5+ sessões reais durante desenvolvimento das stories restantes (NOG-12, NOG-13)
2. Para cada sessão, comparar:
   - `input_tokens + cache_read_input_tokens` (nossa fórmula)
   - `cache_creation_input_tokens` (tokens escritos no cache — potencialmente relevante)
   - Bracket calculado vs bracket esperado baseado no comportamento observado
3. Documentar resultados em tabela

### Questão em Aberto: Incluir `cache_creation_input_tokens`?

| Interpretação | Fórmula | Racional |
|---------------|---------|----------|
| **Conservadora (atual)** | `input + cache_read` | Tokens que Claude "viu" neste turno |
| **Ampla** | `input + cache_read + cache_creation` | Inclui tokens sendo cacheados pela primeira vez |

A fórmula conservadora é o default. Se a validação empírica mostrar delta > 5%, considerar a fórmula ampla.

### Validação

- Coletar dados durante NOG-12/NOG-13 (zero esforço adicional — já temos JSONL)
- Documentar em `docs/research/2026-02-21-uap-synapse-research/effective-context-validation.md`
- Se delta > 5%: ajustar fórmula antes de implementar

---

## C5: Governance — ACs, Benchmark e Evidência (APLICADO)

### Ações Realizadas (retroativas na NOG-11)

1. **ACs marcados com evidência:**
   - AC1 (6 itens): todos [x] com referência ao artefato que os satisfaz
   - AC2 (4 itens): todos [x] com referência ao ADR e handoff
   - AC3: marcado N/A (source found), rollback retido como fallback runtime

2. **Afirmação de confiabilidade rebaixada:**
   - Task 3.2: removido ">99.9% availability", substituído por "High availability expected; confirmed in 2 sessions, broader validation deferred to implementation story"

3. **Benchmark script:**
   - Script original `.tmp-coverage/bench-jsonl.js` foi limpo após execução
   - Resultados documentados em `token-source-investigation.md` §Performance Benchmark
   - Para reprodutibilidade: script será versionado em `tests/synapse/benchmarks/bench-jsonl-tail-read.js` como parte da story de implementação

4. **File List atualizado:**
   - Adicionados handoff, Codex QA review, e este mini-design doc

---

## Checklist de Entrada para NOG-15

A story de implementação **não deve começar** até que estes itens estejam confirmados:

- [ ] **C1:** `updateSessionMetrics()` está no design (não usar `updateSession()` no Stop hook)
- [ ] **C2:** Path confirmado: `.claude/settings.local.json` para registro do Stop hook
- [ ] **C3:** Tail read adaptativo (50KB → 100KB → 200KB → null) no design
- [ ] **C4:** Dados de validação de `effective_context` coletados em 3+ sessões (pode ser paralelo ao desenvolvimento)
- [ ] **C5:** ACs da NOG-11 rastreáveis (FEITO), benchmark reproduzível planejado

---

## Impacto no Esforço

| Story | Estimativa Original | Com Condições | Delta |
|-------|--------------------|--------------| ------|
| NOG-15 (implementação) | 4-6h (1 SP) | 6-8h (2 SP) | +2h para C1 (testes), C3 (fallback), C4 (coleta) |

---

*— Aria, arquitetando o futuro*
