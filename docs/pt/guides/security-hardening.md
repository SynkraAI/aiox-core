# Guia de Hardening de Segurança do AIOS

> [EN](../../guides/security-hardening.md) | **PT** | [ES](../../es/guides/security-hardening.md)

---

> Guia completo para fortalecer a segurança de implantações do Synkra AIOS - do desenvolvimento à produção.

**Versão:** 2.1.0
**Última Atualização:** 2026-01-29

---

## Índice

1. [Visão Geral de Segurança](#visão-geral-de-segurança)
2. [Gerenciamento de Chaves de API](#gerenciamento-de-chaves-de-api)
3. [Variáveis de Ambiente e Segredos](#variáveis-de-ambiente-e-segredos)
4. [Permissões de Arquivos e Diretórios](#permissões-de-arquivos-e-diretórios)
5. [Sandboxing e Isolamento](#sandboxing-e-isolamento)
6. [Validação de Entrada](#validação-de-entrada)
7. [Proteção contra Injeção](#proteção-contra-injeção)
8. [Logging e Auditoria](#logging-e-auditoria)
9. [Configuração de Produção vs Desenvolvimento](#configuração-de-produção-vs-desenvolvimento)
10. [Checklist de Segurança](#checklist-de-segurança)
11. [Relatório de Vulnerabilidades](#relatório-de-vulnerabilidades)

---

## Visão Geral de Segurança

O Synkra AIOS opera em uma camada privilegiada entre modelos de IA e seu sistema. Este guia cobre estratégias de hardening específicas para ambientes de desenvolvimento orquestrados por IA.

### Arquitetura de Segurança

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAMADA EXTERNA                           │
│    Network Firewall | WAF | TLS Termination | Rate Limiting     │
├─────────────────────────────────────────────────────────────────┤
│                      CAMADA DE APLICAÇÃO                        │
│   Permission Modes | Input Validation | Command Sanitization    │
├─────────────────────────────────────────────────────────────────┤
│                       CAMADA DE EXECUÇÃO                        │
│    Sandboxing | Process Isolation | Resource Limits | Hooks     │
├─────────────────────────────────────────────────────────────────┤
│                         CAMADA DE DADOS                         │
│   Encryption at Rest | Secure Storage | Audit Logging           │
└─────────────────────────────────────────────────────────────────┘
```

### Preocupações de Segurança Específicas do AIOS

| Preocupação                | Nível de Risco | Mitigação                         |
| -------------------------- | -------------- | --------------------------------- |
| Execução de código do agente | CRÍTICO      | Permission Modes, Sandboxing      |
| Exposição de chave de API  | CRÍTICO        | Isolamento de ambiente, criptografia |
| Injeção de comando via IA  | ALTO           | Sanitização de entrada, hooks     |
| Acesso não autorizado a arquivos | ALTO     | Restrições de diretório           |
| Sequestro de sessão        | MÉDIO          | Rotação de token, armazenamento seguro |
| Divulgação de informações  | MÉDIO          | Audit logging, controles de acesso |

### Defesa em Profundidade

O AIOS implementa múltiplas camadas de proteção:

1. **Permission Modes** - Controle da autonomia do agente (Explore/Ask/Auto)
2. **Claude Hooks** - Validação pré-execução (read-protection, sql-governance)
3. **Sanitização de Entrada** - Toda entrada de usuário/IA é validada
4. **Isolamento de Processo** - Servidores MCP rodam em containers
5. **Audit Logging** - Todas as operações são registradas

---

## Gerenciamento de Chaves de API

Chaves de API são os segredos mais críticos no AIOS. Chaves comprometidas podem levar a uso não autorizado, violações de dados e impacto financeiro significativo.

### Hierarquia de Armazenamento

```
┌────────────────────────────────────────────────────────────────┐
│  NUNCA                                                         │
│  ❌ Código fonte                                               │
│  ❌ Repositórios Git                                           │
│  ❌ Arquivos de configuração (commitados)                      │
│  ❌ Arquivos de log                                            │
│  ❌ Mensagens de erro                                          │
├────────────────────────────────────────────────────────────────┤
│  ACEITÁVEL (Desenvolvimento)                                   │
│  ⚠️  Arquivos .env (no gitignore)                              │
│  ⚠️  Variáveis de ambiente locais                              │
├────────────────────────────────────────────────────────────────┤
│  RECOMENDADO (Produção)                                        │
│  ✅ Gerenciadores de segredos (Vault, AWS Secrets, etc.)       │
│  ✅ Injeção de segredos via CI/CD                              │
│  ✅ Kubernetes secrets                                         │
│  ✅ Stores de credenciais criptografadas                       │
└────────────────────────────────────────────────────────────────┘
```

### Configuração Segura de Chave de API

**Desenvolvimento (arquivo .env - nunca commitar)**

```bash
# .env - Adicione ao .gitignore IMEDIATAMENTE
# Chaves de Provedor de API
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Chaves de Servidor MCP
EXA_API_KEY=exa-xxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
APIFY_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxx

# Nunca use valores padrão ou fracos
JWT_SECRET=your-256-bit-cryptographically-secure-random-key
```

**Produção (usando gerenciador de segredos)**

```javascript
// Carrega segredos do vault seguro
const secrets = await SecretManager.loadSecrets({
  provider: 'aws-secrets-manager', // ou 'hashicorp-vault', 'gcp-secrets'
  secretName: 'aios/production/api-keys',
  region: process.env.AWS_REGION,
});

process.env.ANTHROPIC_API_KEY = secrets.ANTHROPIC_API_KEY;
process.env.OPENAI_API_KEY = secrets.OPENAI_API_KEY;
```

### Política de Rotação de Chaves

| Tipo de Chave      | Frequência de Rotação | Em Caso de Comprometimento |
| ------------------ | --------------------- | -------------------------- |
| Chaves de Provedor de IA | 90 dias          | Imediato                   |
| JWT Secrets        | 30 dias               | Imediato                   |
| Chaves de Servidor MCP | 90 dias           | Imediato                   |
| Service Tokens     | 7 dias                | Imediato                   |
| Chaves de Desenvolvimento | Nunca reutilizar | Revogar imediatamente     |

### Validação de Chave na Inicialização

```javascript
// .aios-core/core/security/key-validator.js
const requiredKeys = [
  { name: 'ANTHROPIC_API_KEY', pattern: /^sk-ant-[a-zA-Z0-9_-]+$/ },
  { name: 'JWT_SECRET', minLength: 32 },
];

function validateApiKeys() {
  const errors = [];

  for (const key of requiredKeys) {
    const value = process.env[key.name];

    if (!value) {
      errors.push(`Chave obrigatória ausente: ${key.name}`);
      continue;
    }

    if (key.pattern && !key.pattern.test(value)) {
      errors.push(`Formato inválido para ${key.name}`);
    }

    if (key.minLength && value.length < key.minLength) {
      errors.push(`${key.name} deve ter pelo menos ${key.minLength} caracteres`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validação de Chave de API Falhou:\n${errors.join('\n')}`);
  }
}
```

---

## Variáveis de Ambiente e Segredos

### Template Seguro de Arquivo .env

```bash
# ============================================================
# CONFIGURAÇÃO DE AMBIENTE DO AIOS
# ============================================================
# SEGURANÇA: Este arquivo NUNCA deve ser commitado no controle de versão
# Adicione ao .gitignore: .env, .env.local, .env.*.local
# ============================================================

# ------------------------------------------------------------
# AMBIENTE
# ------------------------------------------------------------
NODE_ENV=development
AIOS_DEBUG=false
LOG_LEVEL=info

# ------------------------------------------------------------
# CONFIGURAÇÃO DO PROVEDOR DE IA
# ------------------------------------------------------------
# Provedor principal
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=

# Provedor de fallback (opcional)
OPENAI_API_KEY=

# ------------------------------------------------------------
# AUTENTICAÇÃO & SESSÃO
# ------------------------------------------------------------
# Gere com: openssl rand -hex 32
JWT_SECRET=
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d

# Configuração de sessão
SESSION_SECRET=
SESSION_TIMEOUT=3600000

# ------------------------------------------------------------
# CRIPTOGRAFIA
# ------------------------------------------------------------
# Gere com: openssl rand -hex 32
DATABASE_ENCRYPTION_KEY=
FILE_ENCRYPTION_KEY=

# ------------------------------------------------------------
# SERVIDORES MCP
# ------------------------------------------------------------
# EXA Web Search
EXA_API_KEY=

# Integração GitHub
GITHUB_TOKEN=

# Apify Web Scraping
APIFY_TOKEN=

# ------------------------------------------------------------
# CONFIGURAÇÕES DE SEGURANÇA
# ------------------------------------------------------------
# Rate limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS (apenas produção)
CORS_ORIGIN=https://your-domain.com

# Content Security Policy
CSP_ENABLED=true

# ------------------------------------------------------------
# AUDITORIA & LOGGING
# ------------------------------------------------------------
AUDIT_LOG_ENABLED=true
AUDIT_LOG_PATH=/var/log/aios/audit.log
AUDIT_LOG_RETENTION_DAYS=90
```

### Proteção de Arquivo de Segredos

```bash
# Crie diretório seguro para segredos
mkdir -p ~/.aios/secrets
chmod 700 ~/.aios/secrets

# Crie arquivo de segredos criptografado
# Nunca armazene segredos em texto plano
openssl enc -aes-256-cbc -salt -pbkdf2 \
  -in secrets.txt \
  -out ~/.aios/secrets/encrypted.dat

# Defina permissões adequadas
chmod 600 ~/.aios/secrets/*

# Verifique se não há segredos no histórico do git
git log -p --all -S "API_KEY" -- .
```

### Isolamento de Ambiente

```javascript
// Valide isolamento de ambiente
function validateEnvironment() {
  // Garanta que segredos de produção não são usados em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    if (process.env.ANTHROPIC_API_KEY?.includes('prod')) {
      throw new Error('Chave de API de produção detectada em ambiente de desenvolvimento');
    }
  }

  // Garanta que modo debug está desligado em produção
  if (process.env.NODE_ENV === 'production') {
    if (process.env.AIOS_DEBUG === 'true') {
      console.warn('AVISO: Modo debug habilitado em produção');
    }
  }
}
```

---

## Permissões de Arquivos e Diretórios

### Permissões da Estrutura de Diretórios do AIOS

```bash
# ============================================================
# PERMISSÕES RECOMENDADAS
# ============================================================

# Raiz do projeto (padrão)
chmod 755 /path/to/project

# Diretórios de configuração do AIOS
chmod 700 .aios/              # Apenas o proprietário pode acessar
chmod 700 .aios-core/         # Fonte do framework
chmod 700 .claude/            # Configuração do Claude

# Arquivos de configuração sensíveis
chmod 600 .env                # Variáveis de ambiente
chmod 600 .aios/config.yaml   # Configuração principal
chmod 600 .aios/users.json    # Banco de dados de usuários
chmod 600 .aios/sessions.json # Sessões ativas

# Diretório de segredos
chmod 700 ~/.aios/secrets/
chmod 600 ~/.aios/secrets/*

# Arquivos de log
chmod 640 logs/*.log          # Proprietário leitura/escrita, grupo leitura
chmod 750 logs/               # Proprietário total, grupo leitura/execução

# Arquivos temporários
chmod 700 .aios/temp/
chmod 600 .aios/temp/*
```

### Controle de Acesso a Diretórios

```yaml
# .aios/config.yaml - Configuração de diretórios permitidos
security:
  allowedDirectories:
    read:
      - '${PROJECT_ROOT}'
      - '${HOME}/.aios'
    write:
      - '${PROJECT_ROOT}/src'
      - '${PROJECT_ROOT}/docs'
      - '${PROJECT_ROOT}/tests'
    execute:
      - '${PROJECT_ROOT}/scripts'
      - '${PROJECT_ROOT}/node_modules/.bin'

  blockedPaths:
    - '/etc'
    - '/var'
    - '/usr'
    - '${HOME}/.ssh'
    - '${HOME}/.gnupg'
    - '${HOME}/.aws'
```

### Script de Validação de Permissões

```bash
#!/bin/bash
# scripts/check-permissions.sh

echo "Verificação de Permissões de Segurança do AIOS"
echo "==============================================="

# Verifica arquivos críticos
check_permission() {
  local file=$1
  local expected=$2
  local actual=$(stat -f "%Lp" "$file" 2>/dev/null || stat -c "%a" "$file" 2>/dev/null)

  if [ "$actual" != "$expected" ]; then
    echo "AVISO: $file tem permissões $actual, esperado $expected"
    return 1
  else
    echo "OK: $file ($actual)"
    return 0
  fi
}

# Verifica arquivos críticos
check_permission ".env" "600"
check_permission ".aios" "700"
check_permission ".aios/config.yaml" "600"

# Verifica arquivos sensíveis legíveis por todos
find . -name "*.key" -o -name "*.pem" -o -name "*.env*" | while read f; do
  perms=$(stat -f "%Lp" "$f" 2>/dev/null || stat -c "%a" "$f" 2>/dev/null)
  if [ "${perms: -1}" != "0" ]; then
    echo "CRÍTICO: $f é legível por todos!"
  fi
done

echo ""
echo "Verificação de permissões concluída."
```

---

## Sandboxing e Isolamento

### Isolamento MCP via Docker

O AIOS usa containers Docker para isolar servidores MCP do sistema host:

```
┌─────────────────────────────────────────────────────────────┐
│                      SISTEMA HOST                            │
│                                                              │
│  ┌────────────────┐    ┌────────────────────────────────┐  │
│  │  Claude Code   │    │      Container Docker          │  │
│  │                │    │  ┌──────────────────────────┐  │  │
│  │  ┌──────────┐  │    │  │  docker-gateway          │  │  │
│  │  │ Native   │  │◄──►│  │  ┌─────┐ ┌─────────┐    │  │  │
│  │  │ Tools    │  │    │  │  │ EXA │ │Context7 │    │  │  │
│  │  └──────────┘  │    │  │  └─────┘ └─────────┘    │  │  │
│  │                │    │  │  ┌─────────┐            │  │  │
│  │  ┌──────────┐  │    │  │  │  Apify  │            │  │  │
│  │  │Playwright│  │    │  │  └─────────┘            │  │  │
│  │  └──────────┘  │    │  └──────────────────────────┘  │  │
│  └────────────────┘    └────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Configuração de Segurança do Container

```yaml
# docker-compose.security.yml
version: '3.8'

services:
  mcp-gateway:
    image: docker-mcp-gateway:latest
    security_opt:
      - no-new-privileges:true
      - seccomp:./seccomp-profile.json
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,nodev
    networks:
      - mcp-isolated
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M

networks:
  mcp-isolated:
    driver: bridge
    internal: true # Sem acesso externo
```

### Isolamento de Processo com Permission Modes

```javascript
// Aplicação de permission mode
const { OperationGuard } = require('./.aios-core/core/permissions');

async function executeWithIsolation(operation, context) {
  const guard = new OperationGuard();

  // Verifica se a operação é permitida no modo atual
  const permission = await guard.guard(operation.tool, {
    command: operation.command,
    args: operation.args,
  });

  if (!permission.proceed) {
    if (permission.needsConfirmation) {
      // Solicita confirmação do usuário
      const confirmed = await requestUserConfirmation(operation);
      if (!confirmed) {
        throw new Error('Operação negada pelo usuário');
      }
    } else {
      throw new Error(`Operação bloqueada: ${permission.reason}`);
    }
  }

  // Executa em contexto isolado
  return await isolatedExecutor.run(operation, {
    timeout: 30000,
    maxMemory: '256M',
    networkAccess: false,
  });
}
```

### Limites de Recursos

```javascript
// Configuração de limites de recursos
const resourceLimits = {
  cpu: {
    maxPercent: 50,
    throttleAt: 80,
  },
  memory: {
    maxMB: 512,
    warnAt: 400,
  },
  disk: {
    maxWriteMB: 100,
    tempDirMaxMB: 50,
  },
  network: {
    maxRequestsPerMinute: 100,
    maxBandwidthMBps: 10,
  },
  process: {
    maxConcurrent: 5,
    maxRuntime: 300000, // 5 minutos
  },
};
```

---

## Validação de Entrada

### Regras de Validação por Tipo de Entrada

| Tipo de Entrada     | Regras de Validação                     | Exemplo                   |
| ------------------- | --------------------------------------- | ------------------------- |
| **Caminhos de arquivo** | Sem traversal, whitelist dirs, normalize | `/project/src/file.ts`  |
| **Comandos**        | Whitelist de comandos, sanitizar args   | `npm run build`           |
| **Nomes de projeto** | Alfanumérico, hifens, underscores      | `my-project-01`           |
| **URLs**            | Whitelist de protocolo, validação de domínio | `https://api.example.com` |
| **Entrada do usuário** | Limites de tamanho, filtragem de caracteres | `Comentário do usuário aqui` |
| **Configuração**    | Verificação de tipo, validação de enum  | `{ mode: "ask" }`         |

### Implementação do Sanitizador de Entrada

```javascript
// .aios-core/core/security/input-sanitizer.js

class InputSanitizer {
  /**
   * Sanitiza caminho de arquivo para prevenir directory traversal
   */
  static sanitizePath(inputPath, basePath) {
    // Remove null bytes
    let sanitized = inputPath.replace(/\0/g, '');

    // Normaliza separadores de caminho
    sanitized = sanitized.replace(/\\/g, '/');

    // Remove tentativas de directory traversal
    sanitized = sanitized.replace(/\.\.+\//g, '');
    sanitized = sanitized.replace(/\/\.\.+/g, '');

    // Resolve para caminho absoluto
    const resolved = path.resolve(basePath, sanitized);

    // Verifica se o caminho está dentro do diretório permitido
    if (!resolved.startsWith(path.resolve(basePath))) {
      throw new SecurityError('Tentativa de path traversal detectada');
    }

    return resolved;
  }

  /**
   * Sanitiza comando para execução segura
   */
  static sanitizeCommand(command) {
    // Bloqueia padrões perigosos
    const dangerousPatterns = [
      /;/g, // Encadeamento de comandos
      /\|/g, // Pipes
      /&/g, // Background/AND
      /`/g, // Substituição de comando
      /\$\(/g, // Substituição de comando
      />/g, // Redirect
      /</g, // Redirect
      /\n/g, // Newlines
      /\r/g, // Carriage returns
    ];

    let sanitized = command;
    for (const pattern of dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Limita tamanho
    if (sanitized.length > 1000) {
      throw new SecurityError('Comando muito longo');
    }

    return sanitized;
  }

  /**
   * Valida e sanitiza nome de projeto
   */
  static sanitizeProjectName(name) {
    // Permite apenas alfanumérico, hifens e underscores
    const sanitized = name.replace(/[^a-zA-Z0-9-_]/g, '');

    if (sanitized.length === 0) {
      throw new SecurityError('Nome de projeto inválido');
    }

    if (sanitized.length > 64) {
      throw new SecurityError('Nome de projeto muito longo');
    }

    return sanitized;
  }

  /**
   * Valida URL
   */
  static validateUrl(url) {
    const allowedProtocols = ['https:', 'http:'];

    try {
      const parsed = new URL(url);

      if (!allowedProtocols.includes(parsed.protocol)) {
        throw new SecurityError('Protocolo de URL inválido');
      }

      // Bloqueia localhost em produção
      if (process.env.NODE_ENV === 'production') {
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          throw new SecurityError('URLs localhost não são permitidas em produção');
        }
      }

      return parsed.toString();
    } catch (error) {
      throw new SecurityError(`URL inválida: ${error.message}`);
    }
  }
}
```

### Validação de Schema

```javascript
// Use JSON Schema para validação de configuração
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const configSchema = {
  type: 'object',
  required: ['version', 'permissions'],
  properties: {
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    permissions: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['explore', 'ask', 'auto'] },
      },
      required: ['mode'],
    },
    security: {
      type: 'object',
      properties: {
        allowedDirectories: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  },
  additionalProperties: false,
};

function validateConfig(config) {
  const validate = ajv.compile(configSchema);
  const valid = validate(config);

  if (!valid) {
    throw new SecurityError(`Validação de configuração falhou: ${JSON.stringify(validate.errors)}`);
  }

  return config;
}
```

---

## Proteção contra Injeção

### Prevenção de Injeção de Comando

```javascript
// PERIGOSO - Nunca faça isso
const userInput = req.query.file;
exec(`cat ${userInput}`); // Vulnerabilidade de injeção de comando!

// SEGURO - Use execução parametrizada
const { execFile } = require('child_process');
const userInput = sanitizePath(req.query.file, PROJECT_ROOT);
execFile('cat', [userInput], (error, stdout) => {
  // Execução segura
});

// MAIS SEGURO - Use operações de arquivo nativas
const fs = require('fs').promises;
const safePath = sanitizePath(req.query.file, PROJECT_ROOT);
const content = await fs.readFile(safePath, 'utf8');
```

### Prevenção de Injeção SQL (SQL Governance Hook)

```python
# .claude/hooks/sql-governance.py
# Este hook é aplicado automaticamente

BLOCKED_PATTERNS = [
    r'CREATE\s+TABLE',
    r'DROP\s+TABLE',
    r'ALTER\s+TABLE',
    r'TRUNCATE',
    r'DELETE\s+FROM',
    r'UPDATE\s+.*\s+SET',
    r'INSERT\s+INTO',
]

def validate_sql(query: str) -> bool:
    """Bloqueia operações SQL perigosas sem aprovação explícita"""
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, query, re.IGNORECASE):
            raise SecurityError(f"Padrão SQL bloqueado detectado: {pattern}")
    return True
```

### Prevenção de Injeção de Template

```javascript
// PERIGOSO - Interpolação direta de template
const template = `Hello ${userInput}!`; // Vulnerabilidade XSS!

// SEGURO - Encoding HTML
const { escape } = require('html-escaper');
const template = `Hello ${escape(userInput)}!`;

// Para templates Markdown
function safeMarkdownInterpolation(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    if (value === undefined) return match;

    // Escape caracteres especiais do Markdown
    return String(value).replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
  });
}
```

### Prevenção de Path Traversal

```javascript
// Aplicação de hook para arquivos protegidos
// .claude/hooks/read-protection.py

PROTECTED_FILES = [
    '.claude/CLAUDE.md',
    '.claude/rules/*.md',
    '.aios-core/development/agents/*.md',
    'package.json',
    'tsconfig.json'
]

def validate_read(file_path: str, params: dict) -> bool:
    """Bloqueia leituras parciais em arquivos protegidos"""
    for pattern in PROTECTED_FILES:
        if fnmatch.fnmatch(file_path, pattern):
            if params.get('limit') or params.get('offset'):
                raise SecurityError(
                    f"Leitura parcial bloqueada em arquivo protegido: {file_path}\n"
                    "Deve ler o arquivo completo."
                )
    return True
```

### Prevenção de Prototype Pollution

```javascript
// Previne ataques de prototype pollution
function safeObjectMerge(target, source) {
  const blockedKeys = ['__proto__', 'constructor', 'prototype'];

  function merge(t, s, depth = 0) {
    if (depth > 10) {
      throw new SecurityError('Profundidade de merge de objeto excedida');
    }

    for (const key of Object.keys(s)) {
      if (blockedKeys.includes(key)) {
        throw new SecurityError(`Propriedade bloqueada: ${key}`);
      }

      if (typeof s[key] === 'object' && s[key] !== null) {
        t[key] = t[key] || {};
        merge(t[key], s[key], depth + 1);
      } else {
        t[key] = s[key];
      }
    }

    return t;
  }

  return merge(target, source);
}
```

---

## Logging e Auditoria

### Configuração de Audit Log

```yaml
# .aios/config.yaml - Configuração de auditoria
audit:
  enabled: true
  level: info # debug, info, warn, error

  # O que logar
  events:
    - authentication
    - authorization
    - fileAccess
    - commandExecution
    - configChange
    - agentActivation
    - modeChange
    - error

  # Configuração de saída
  output:
    file:
      enabled: true
      path: .aios/logs/audit.log
      maxSize: 10M
      maxFiles: 10
      compress: true
    console:
      enabled: false
    remote:
      enabled: false
      endpoint: https://logs.example.com/audit

  # Retenção
  retention:
    days: 90
    archivePath: .aios/logs/archive
```

### Formato do Audit Log

```json
{
  "timestamp": "2026-01-29T14:30:00.000Z",
  "level": "info",
  "event": "commandExecution",
  "actor": {
    "type": "agent",
    "id": "dev",
    "name": "Dex"
  },
  "action": {
    "type": "execute",
    "tool": "Bash",
    "command": "npm run build"
  },
  "context": {
    "mode": "ask",
    "project": "my-project",
    "story": "1.1"
  },
  "result": {
    "status": "success",
    "duration": 12500
  },
  "security": {
    "approved": true,
    "approvedBy": "user",
    "riskLevel": "low"
  }
}
```

### Implementação do Audit Logger

```javascript
// .aios-core/core/security/audit-logger.js

const winston = require('winston');
const { format } = winston;

class AuditLogger {
  constructor(config) {
    this.config = config;
    this.logger = this.createLogger();
  }

  createLogger() {
    const transports = [];

    if (this.config.output.file.enabled) {
      transports.push(
        new winston.transports.File({
          filename: this.config.output.file.path,
          maxsize: this.parseSize(this.config.output.file.maxSize),
          maxFiles: this.config.output.file.maxFiles,
          tailable: true,
        })
      );
    }

    return winston.createLogger({
      level: this.config.level,
      format: format.combine(format.timestamp(), format.json()),
      transports,
    });
  }

  log(event, data) {
    if (!this.config.events.includes(event)) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      event,
      ...this.sanitizeData(data),
    };

    this.logger.info(entry);
  }

  sanitizeData(data) {
    // Remove informações sensíveis antes de logar
    const sensitivePatterns = [/api[_-]?key/i, /password/i, /secret/i, /token/i, /auth/i];

    const sanitized = JSON.parse(JSON.stringify(data));

    function redact(obj) {
      for (const key of Object.keys(obj)) {
        if (sensitivePatterns.some((p) => p.test(key))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          redact(obj[key]);
        }
      }
    }

    redact(sanitized);
    return sanitized;
  }

  // Métodos específicos de logging
  logAuthentication(result, context) {
    this.log('authentication', {
      action: { type: 'authenticate', result: result.success ? 'success' : 'failure' },
      context,
      security: { failureReason: result.reason },
    });
  }

  logCommandExecution(command, result, context) {
    this.log('commandExecution', {
      action: { type: 'execute', command },
      result: { status: result.success ? 'success' : 'failure', duration: result.duration },
      context,
    });
  }

  logFileAccess(path, operation, context) {
    this.log('fileAccess', {
      action: { type: operation, path },
      context,
    });
  }

  logSecurityEvent(event, severity, details) {
    this.log('security', {
      action: { type: event },
      security: { severity, ...details },
    });
  }
}

module.exports = AuditLogger;
```

### Queries de Análise de Log

```bash
# Encontra todas as autenticações falhas
jq 'select(.event == "authentication" and .result.status == "failure")' audit.log

# Encontra todas as execuções de comando por agente
jq 'select(.event == "commandExecution" and .actor.type == "agent")' audit.log

# Encontra todos os eventos de segurança nas últimas 24 horas
jq 'select(.event == "security" and (.timestamp | fromdateiso8601) > (now - 86400))' audit.log

# Conta eventos por tipo
jq -s 'group_by(.event) | map({event: .[0].event, count: length})' audit.log
```

---

## Configuração de Produção vs Desenvolvimento

### Detecção de Ambiente

```javascript
// Carregamento de configuração consciente do ambiente
function loadSecurityConfig() {
  const env = process.env.NODE_ENV || 'development';

  const baseConfig = require('./security-config.base.json');
  const envConfig = require(`./security-config.${env}.json`);

  return deepMerge(baseConfig, envConfig);
}
```

### Comparação de Configuração

| Configuração         | Desenvolvimento       | Produção         |
| -------------------- | --------------------- | ---------------- |
| **AIOS_DEBUG**       | `true`                | `false`          |
| **LOG_LEVEL**        | `debug`               | `info`           |
| **Permission Mode**  | `auto`                | `ask`            |
| **Rate Limiting**    | Relaxado              | Estrito          |
| **CORS**             | `*`                   | Origens específicas |
| **Detalhes de Erro** | Stack traces completas | Mensagens genéricas |
| **Validação de Chave de API** | Apenas aviso  | Bloqueia se inválido |
| **SSL/TLS**          | Opcional              | Obrigatório      |
| **Audit Logging**    | Opcional              | Obrigatório      |
| **Timeout de Sessão** | 24 horas             | 1 hora           |

### Configuração de Desenvolvimento

```yaml
# .aios/config.development.yaml
security:
  debug: true

  validation:
    strict: false
    warnOnly: true

  rateLimiting:
    enabled: false

  cors:
    origin: '*'
    credentials: true

  session:
    timeout: 86400000 # 24 horas
    secure: false

  audit:
    enabled: true
    level: debug
    console: true

  permissions:
    mode: auto
```

### Configuração de Produção

```yaml
# .aios/config.production.yaml
security:
  debug: false

  validation:
    strict: true
    warnOnly: false

  rateLimiting:
    enabled: true
    windowMs: 900000 # 15 minutos
    maxRequests: 1000

  cors:
    origin:
      - https://app.example.com
      - https://admin.example.com
    credentials: true

  session:
    timeout: 3600000 # 1 hora
    secure: true
    sameSite: strict

  tls:
    enabled: true
    minVersion: TLSv1.2
    ciphers: ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384

  headers:
    hsts: true
    hstsMaxAge: 31536000
    xssProtection: true
    noSniff: true
    frameOptions: DENY

  audit:
    enabled: true
    level: info
    console: false
    remote:
      enabled: true
      endpoint: https://logs.example.com/audit

  permissions:
    mode: ask
    requireApprovalFor:
      - delete
      - execute
```

### Script de Validação de Ambiente

```javascript
// Valida requisitos de segurança de produção
function validateProductionSecurity() {
  const errors = [];

  // Variáveis de ambiente obrigatórias
  const required = ['JWT_SECRET', 'DATABASE_ENCRYPTION_KEY', 'SESSION_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Variável de ambiente obrigatória ausente: ${key}`);
    }
  }

  // Debug deve estar desligado
  if (process.env.AIOS_DEBUG === 'true') {
    errors.push('AIOS_DEBUG deve ser false em produção');
  }

  // TLS deve estar habilitado (verifica arquivos de certificado)
  if (!fs.existsSync(process.env.TLS_CERT_PATH)) {
    errors.push('Certificado TLS não encontrado');
  }

  // Força do segredo
  if (process.env.JWT_SECRET?.length < 32) {
    errors.push('JWT_SECRET deve ter pelo menos 32 caracteres');
  }

  if (errors.length > 0) {
    throw new Error(`Validação de segurança de produção falhou:\n${errors.join('\n')}`);
  }

  console.log('Validação de segurança de produção passou');
}
```

---

## Checklist de Segurança

### Checklist Pré-Implantação

```markdown
## Checklist de Segurança Pré-Implantação

### Gerenciamento de Segredos

- [ ] Todas as chaves de API armazenadas em variáveis de ambiente ou gerenciador de segredos
- [ ] Nenhum segredo no código fonte ou histórico do git
- [ ] Arquivo .env adicionado ao .gitignore
- [ ] Segredos de produção usam chaves separadas de desenvolvimento
- [ ] Cronograma de rotação de segredos estabelecido

### Configuração

- [ ] NODE_ENV definido como 'production'
- [ ] Modo debug desabilitado
- [ ] Mensagens de erro não expõem detalhes internos
- [ ] Rate limiting configurado e testado
- [ ] CORS configurado corretamente para domínios de produção

### Autenticação & Autorização

- [ ] Política de senha forte aplicada
- [ ] JWT secrets são criptograficamente fortes (32+ caracteres)
- [ ] Expiração de token definida apropriadamente
- [ ] Gerenciamento de sessão implementado
- [ ] Permission modes configurados (padrão: ask)

### Validação de Entrada

- [ ] Toda entrada de usuário sanitizada
- [ ] Validação de caminho de arquivo habilitada
- [ ] Proteção contra injeção de comando ativa
- [ ] SQL governance hooks instalados
- [ ] Validação de schema para configuração

### Segurança de Rede

- [ ] TLS 1.2+ obrigatório
- [ ] Headers de segurança configurados (HSTS, CSP, etc.)
- [ ] Portas desnecessárias fechadas
- [ ] Regras de firewall implementadas

### Logging & Monitoramento

- [ ] Audit logging habilitado
- [ ] Arquivos de log protegidos (permissões 640)
- [ ] Dados sensíveis ocultados dos logs
- [ ] Alertas configurados para eventos de segurança
- [ ] Política de retenção de log estabelecida

### Segurança de Dependências

- [ ] npm audit não mostra vulnerabilidades críticas
- [ ] Dependabot ou similar habilitado
- [ ] Lockfile commitado e verificado
```

### Checklist de Segurança Contínua

```markdown
## Manutenção de Segurança Contínua

### Semanal

- [ ] Revisar alertas de segurança do monitoramento
- [ ] Verificar novas vulnerabilidades de dependências
- [ ] Revisar logs de acesso para anomalias

### Mensal

- [ ] Executar scan de segurança completo (npm audit, snyk)
- [ ] Atualizar dependências com patches de segurança
- [ ] Revisar e rotacionar service tokens
- [ ] Auditar acesso de usuários e permissões

### Trimestral

- [ ] Teste de penetração completo
- [ ] Revisar e atualizar políticas de segurança
- [ ] Rotacionar segredos de longa duração (chaves de API, JWT secrets)
- [ ] Atualização de treinamento de segurança

### Anual

- [ ] Auditoria de segurança por terceiros
- [ ] Teste de recuperação de desastres
- [ ] Rotação completa de segredos
- [ ] Revisão de arquitetura de segurança
```

---

## Relatório de Vulnerabilidades

### Política de Divulgação Responsável

Se você descobrir uma vulnerabilidade de segurança no Synkra AIOS, por favor siga práticas de divulgação responsável:

### Processo de Relatório

1. **NÃO** crie uma issue pública no GitHub para vulnerabilidades de segurança
2. Reporte preocupações de segurança via [GitHub Security Advisories](https://github.com/SynkraAI/aios-core/security/advisories)
3. Inclua o seguinte no seu relatório:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Avaliação de impacto potencial
   - Quaisquer correções sugeridas (opcional)

### O que Incluir

```markdown
## Template de Relatório de Vulnerabilidade

**Tipo de Vulnerabilidade:** [ex: Command Injection, XSS, Auth Bypass]

**Severidade:** [Crítica / Alta / Média / Baixa]

**Componente Afetado:** [ex: InputSanitizer, AuthSystem, MCP Gateway]

**Versão do AIOS:** [ex: 2.1.0]

**Descrição:**
[Descrição detalhada da vulnerabilidade]

**Passos para Reproduzir:**

1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Prova de Conceito:**
[Código ou comandos para demonstrar a vulnerabilidade]

**Impacto:**
[O que um atacante poderia realizar com esta vulnerabilidade]

**Correção Sugerida:**
[Opcional: Sua recomendação para corrigir o problema]
```

### Cronograma de Resposta

| Estágio                | Prazo                  |
| ---------------------- | ---------------------- |
| Reconhecimento inicial | 24 horas               |
| Avaliação preliminar   | 72 horas               |
| Desenvolvimento da correção | 7-14 dias         |
| Lançamento do patch    | 14-30 dias             |
| Divulgação pública     | 90 dias (ou após correção) |

### Hall da Fama de Segurança

Contribuidores que divulgam vulnerabilidades de forma responsável são reconhecidos em nosso Hall da Fama de Segurança (com permissão).

### Programa de Bug Bounty

Atualmente, o Synkra AIOS não possui um programa formal de bug bounty. No entanto, contribuições significativas de segurança são reconhecidas e podem receber licenças AIOS Pro ou outro reconhecimento.

---

## Documentação Relacionada

- [Melhores Práticas de Segurança](../../security-best-practices.md) - Diretrizes gerais de segurança
- [Guia de Permission Modes](./permission-modes.md) - Controle de autonomia do agente
- [Setup Global do MCP](./mcp-global-setup.md) - Configuração segura do MCP
- [Quality Gates](./quality-gates.md) - Verificações de segurança no CI/CD

---

_Guia de Hardening de Segurança do Synkra AIOS v4.0_
