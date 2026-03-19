# Bash Compliance — Claude Code Hardcoded Restrictions

## Context

Claude Code impoe bloqueios hardcoded de seguranca que a allow list
do settings.json NAO consegue sobrescrever. Todo agente que gera
comandos Bash DEVE seguir estas regras.

## Restricoes Absolutas (NUNCA usar)

| Pattern | Tipo | Alternativa |
|---------|------|-------------|
| `&&` | Encadeamento | Chamadas Bash separadas |
| `;` | Encadeamento | Chamadas Bash separadas |
| `\|\|` | Encadeamento condicional | Chamadas Bash separadas com logica no agente |
| `$()` | Command substitution | Chamada separada, capturar output, usar valor literal |
| `` `cmd` `` | Command substitution | Igual a `$()` |
| `$VAR` inline | Variable expansion | Ler em chamada separada, passar valor literal |
| `>` | Output redirection | Usar `tee` para salvar em arquivo |
| `-o file` (curl) | Output to file | Pipe para `tee`: `curl ... \| tee file` |

## Padrao Correto: Operacoes Sequenciais

### ERRADO:
```bash
source .env; curl -s "...&key=$API_KEY" -o /tmp/result.json
```

### CORRETO:
```
Bash call 1: source .env
Bash call 2: echo $API_KEY  (capturar valor)
Bash call 3: curl -s "...&key=VALOR_LITERAL" | tee /tmp/result.json
```

Cada operacao e uma chamada Bash separada do Claude Code.
O agente captura o output de cada chamada e usa o valor literal na proxima.

## Padrao Correto: Operacoes Independentes

Quando operacoes nao dependem uma da outra, executar em **paralelo**
(multiplas chamadas Bash no mesmo response).

### ERRADO:
```bash
pnpm run lint && pnpm run test && pnpm run typecheck
```

### CORRETO:
```
Bash call 1 (paralelo): pnpm run lint
Bash call 2 (paralelo): pnpm run test
Bash call 3 (paralelo): pnpm run typecheck
```

## Padrao Correto: Salvar Output

### ERRADO:
```bash
curl -s https://api.example.com/data > /tmp/data.json
curl -s https://api.example.com/data -o /tmp/data.json
```

### CORRETO:
```bash
curl -s https://api.example.com/data | tee /tmp/data.json
```

## Edge Cases

### Binarios e outputs grandes
Para arquivos binarios ou outputs muito grandes, usar `tee` com `--output-error=warn`
para evitar corrupcao silenciosa:
```bash
curl -s https://example.com/large-file.zip | tee --output-error=warn /tmp/large-file.zip
```

### Multiplos arquivos de output
Cada arquivo requer sua propria chamada Bash:
```
Bash call 1: curl -s https://api.example.com/mobile | tee /tmp/mobile.json
Bash call 2: curl -s https://api.example.com/desktop | tee /tmp/desktop.json
```

## Aplicabilidade

- TODOS os agentes AIOX (core e squad)
- TODAS as tasks que contenham campos `command:` ou `method:`
- TODOS os workflows que gerem comandos Bash
- TODOS os scripts referenciados por agentes
