<!--
  Tradução: PT-BR
  Original: /docs/en/security-best-practices.md
  Última sincronização: 2026-01-26
-->

# Melhores Práticas de Segurança do Synkra AIOX

> 🌐 [EN](../security-best-practices.md) | **PT** | [ES](../es/security-best-practices.md)

---

Este guia fornece recomendações abrangentes de segurança para implantação e manutenção do Synkra AIOX em ambientes de produção.

## Índice

1. [Visão Geral da Arquitetura de Segurança](#visão-geral-da-arquitetura-de-segurança)
2. [Autenticação e Autorização](#autenticação-e-autorização)
3. [Validação e Sanitização de Entrada](#validação-e-sanitização-de-entrada)
4. [Rate Limiting e Proteção contra DOS](#rate-limiting-e-proteção-contra-dos)
5. [Configuração Segura](#configuração-segura)
6. [Proteção de Dados](#proteção-de-dados)
7. [Logging e Monitoramento](#logging-e-monitoramento)
8. [Segurança de Rede](#segurança-de-rede)
9. [Gerenciamento de Dependências](#gerenciamento-de-dependências)
10. [Resposta a Incidentes](#resposta-a-incidentes)

## Visão Geral da Arquitetura de Segurança

O Synkra AIOX implementa uma abordagem de segurança em múltiplas camadas:

```
┌─────────────────────────────────────────┐
│           Camada de Aplicação           │
├─────────────────────────────────────────┤
│         Camada de Autenticação          │
├─────────────────────────────────────────┤
│      Camada de Validação de Entrada     │
├─────────────────────────────────────────┤
│         Camada de Rate Limiting         │
├─────────────────────────────────────────┤
│            Camada de Rede               │
└─────────────────────────────────────────┘
```

### Módulos Principais de Segurança

- **InputSanitizer**: Previne ataques de injeção e traversal de diretório
- **AuthSystem**: Autenticação baseada em JWT com gerenciamento de sessão
- **RateLimiter**: Proteção contra DOS e prevenção de abuso
- **SecurityAudit**: Varredura automatizada de vulnerabilidades

## Autenticação e Autorização

### Implementação

```javascript
const AuthSystem = require('./security/auth');

const auth = new AuthSystem({
  secretKey: process.env.JWT_SECRET,
  tokenExpiry: '1h',
  refreshExpiry: '7d'
});

// Criar usuário com requisitos de senha forte
await auth.createUser({
  username: 'admin',
  password: 'SecureP@ssw0rd123!',
  email: 'admin@example.com',
  role: 'admin'
});
```

### Melhores Práticas

1. **Política de Senha Forte**
   - Mínimo de 12 caracteres
   - Mistura de maiúsculas, minúsculas, números, símbolos
   - Sem palavras de dicionário ou informações pessoais

2. **Gerenciamento de Tokens**
   - Tokens de acesso de curta duração (1 hora)
   - Rotação segura de refresh tokens
   - Revogação imediata no logout

3. **Segurança de Sessão**
   - Armazenamento seguro de sessão
   - Timeout de sessão após inatividade
   - Gerenciamento de múltiplas sessões

4. **Proteção de Conta**
   - Bloqueio de conta após tentativas falhas
   - Atrasos progressivos em falhas de autenticação
   - Notificações por email para eventos de segurança

### Configuração

```env
# .env - Configurações de autenticação
JWT_SECRET=your-super-secure-random-key-here
AUTH_TOKEN_EXPIRY=1h
AUTH_REFRESH_EXPIRY=7d
AUTH_MAX_LOGIN_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=15m
```

## Validação e Sanitização de Entrada

### Sempre Sanitize Entrada do Usuário

```javascript
const InputSanitizer = require('./security/sanitizer');

// Sanitização de path
const safePath = InputSanitizer.sanitizePath(userInput, basePath);

// Validação de nome de projeto
const safeProjectName = InputSanitizer.sanitizeProjectName(name);

// Sanitização de comando
const safeCommand = InputSanitizer.sanitizeCommand(userCommand);

// Valores de configuração
const safeValue = InputSanitizer.sanitizeConfigValue(value, 'string');
```

### Regras de Validação

1. **Operações de Path**
   - Sempre use paths absolutos
   - Previna traversal de diretório (../)
   - Valide contra diretórios permitidos
   - Verifique padrões suspeitos

2. **Execução de Comandos**
   - Whitelist de caracteres permitidos
   - Remova separadores de comando (;, |, &)
   - Limite o tamanho do comando
   - Use execução parametrizada

3. **Dados de Configuração**
   - Validação de tipo
   - Restrições de tamanho
   - Pattern matching
   - Validação de enum quando aplicável

### Vulnerabilidades Comuns a Prevenir

- **Path Traversal**: `../../../etc/passwd`
- **Command Injection**: `; rm -rf /`
- **SQL Injection**: `'; DROP TABLE users; --`
- **XSS**: `<script>alert('xss')</script>`
- **Prototype Pollution**: `{"__proto__": {"admin": true}}`

## Rate Limiting e Proteção contra DOS

### Implementação

```javascript
const { RateLimiters } = require('./security/rate-limiter');

// Diferentes limitadores para diferentes operações
const apiLimiter = RateLimiters.createApiLimiter();
const authLimiter = RateLimiters.createAuthLimiter();
const metaAgentLimiter = RateLimiters.createMetaAgentLimiter();

// Verificar antes da operação
const identifier = RateLimiter.createIdentifier({
  ip: req.ip,
  userId: req.user?.id,
  operation: 'meta-agent'
});

const result = metaAgentLimiter.check(identifier);
if (!result.allowed) {
  throw new Error(`Limite de rate excedido. Tente novamente após ${result.retryAfter} segundos`);
}
```

### Estratégia de Rate Limiting

| Operação | Janela | Limite | Propósito |
|----------|--------|--------|-----------|
| API Calls | 15 min | 1000 | Proteção geral da API |
| Autenticação | 15 min | 5 | Prevenção de força bruta |
| Instalação | 1 hora | 10 | Prevenção de abuso de instalação |
| Meta-Agent | 1 min | 30 | Proteção de recursos |
| Operações de Arquivo | 1 min | 100 | Proteção do filesystem |

### Configuração

```env
# Configurações de rate limiting
RATE_LIMIT_API_WINDOW=900000
RATE_LIMIT_API_MAX=1000
RATE_LIMIT_AUTH_WINDOW=900000
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_INSTALL_WINDOW=3600000
RATE_LIMIT_INSTALL_MAX=10
```

## Configuração Segura

### Variáveis de Ambiente

```env
# Configurações de segurança obrigatórias
NODE_ENV=production
JWT_SECRET=your-256-bit-secret-key
DATABASE_ENCRYPTION_KEY=your-database-encryption-key
SESSION_SECRET=your-session-secret

# API Keys (nunca hardcode!)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-your-anthropic-key

# Headers de segurança
SECURITY_HEADERS_ENABLED=true
HELMET_ENABLED=true
CORS_ORIGIN=https://yourdomain.com

# Logging de auditoria
AUDIT_LOG_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_LOG_FILE=/var/log/aiox/audit.log
```

### Permissões de Arquivo

```bash
# Permissões de arquivo seguras
chmod 600 .env
chmod 600 .aiox/config.json
chmod 600 .aiox/users.json
chmod 600 .aiox/sessions.json
chmod 700 .aiox/
chmod 700 security/
```

### Validação de Configuração

```javascript
// Validar configuração crítica na inicialização
const requiredEnvVars = [
  'JWT_SECRET',
  'NODE_ENV'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${envVar}`);
  }
}

// Validar força do JWT secret
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres');
}
```

## Proteção de Dados

### Criptografia em Repouso

```javascript
const crypto = require('crypto');

class DataEncryption {
  constructor(key) {
    this.key = key;
    this.algorithm = 'aes-256-gcm';
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(
      this.algorithm,
      this.key,
      Buffer.from(encryptedData.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### Manuseio de Dados Sensíveis

1. **API Keys**
   - Armazene apenas em variáveis de ambiente
   - Nunca registre em log ou exponha em mensagens de erro
   - Rotacione regularmente
   - Use chaves separadas para diferentes ambientes

2. **Dados de Usuário**
   - Hash de senhas com bcrypt (salt rounds ≥ 12)
   - Criptografe PII em repouso
   - Implemente políticas de retenção de dados
   - Suporte a solicitações de exclusão de dados

3. **Dados de Sessão**
   - Use armazenamento seguro de sessão
   - Implemente timeout de sessão
   - Limpe sessões no logout
   - Monitore sequestro de sessão

## Logging e Monitoramento

### Logging de Eventos de Segurança

```javascript
const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/security.log',
      level: 'warn'
    }),
    new winston.transports.File({
      filename: 'logs/audit.log'
    })
  ]
});

// Registrar eventos de segurança
securityLogger.warn('Falha de autenticação', {
  username: req.body.username,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
});
```

### Eventos para Monitorar

- Tentativas de autenticação falhas
- Violações de rate limit
- Padrões suspeitos de acesso a arquivos
- Mudanças de configuração
- Tentativas de escalação de privilégios
- Padrões incomuns de uso da API

### Limiares de Alerta

```javascript
const alertThresholds = {
  failedLogins: 10, // por hora
  rateLimitViolations: 50, // por hora
  suspiciousFileAccess: 5, // por hora
  configChanges: 1, // qualquer mudança
  errorRate: 0.05 // taxa de erro de 5%
};
```

## Segurança de Rede

### Configuração HTTPS

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem'),
  // Melhorias de segurança
  secureProtocol: 'TLSv1_2_method',
  ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
  honorCipherOrder: true
};

https.createServer(options, app).listen(443);
```

### Headers de Segurança

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Configuração CORS

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Gerenciamento de Dependências

### Varredura de Segurança

```bash
# Auditorias de segurança regulares
npm audit
npm audit fix

# Usando yarn
yarn audit
yarn audit fix

# Varredura avançada com snyk
npx snyk test
npx snyk monitor
```

### Estratégia de Atualização

```json
{
  "scripts": {
    "security:audit": "npm audit",
    "security:update": "npm update",
    "security:check": "snyk test",
    "security:monitor": "snyk monitor"
  }
}
```

### Atualizações Automatizadas de Dependências

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    reviewers:
      - "security-team"
```

## Resposta a Incidentes

### Procedimentos de Resposta

1. **Detecção**
   - Monitorar logs de segurança
   - Configurar alertas automatizados
   - Auditorias de segurança regulares

2. **Avaliação**
   - Determinar escopo e impacto
   - Identificar sistemas afetados
   - Classificar severidade do incidente

3. **Contenção**
   - Isolar sistemas afetados
   - Revogar credenciais comprometidas
   - Bloquear tráfego malicioso

4. **Recuperação**
   - Restaurar de backups limpos
   - Aplicar patches de segurança
   - Atualizar medidas de segurança

5. **Lições Aprendidas**
   - Documentar detalhes do incidente
   - Atualizar procedimentos de segurança
   - Melhorar monitoramento

### Contatos de Emergência

```javascript
// Configuração de resposta a emergências
const emergencyConfig = {
  securityTeam: {
    primary: 'security-lead@company.com',
    backup: 'security-backup@company.com'
  },
  escalation: {
    level1: 'team-lead@company.com',
    level2: 'engineering-manager@company.com',
    level3: 'cto@company.com'
  },
  externalContacts: {
    hosting: 'support@hosting-provider.com',
    security: 'security@security-vendor.com'
  }
};
```

## Checklist de Segurança

### Pré-Implantação

- [ ] Todos os módulos de segurança implementados
- [ ] Sanitização de entrada em vigor
- [ ] Rate limiting configurado
- [ ] Sistema de autenticação testado
- [ ] Auditoria de segurança concluída
- [ ] Teste de penetração realizado
- [ ] Certificados SSL/TLS instalados
- [ ] Headers de segurança configurados
- [ ] Logging e monitoramento ativos
- [ ] Plano de resposta a incidentes pronto

### Pós-Implantação

- [ ] Varreduras de segurança regulares agendadas
- [ ] Atualizações de dependências automatizadas
- [ ] Monitoramento de logs ativo
- [ ] Procedimentos de backup testados
- [ ] Controles de acesso revisados
- [ ] Treinamento de segurança concluído
- [ ] Documentação atualizada

### Manutenção Contínua

- [ ] Revisão semanal de logs de segurança
- [ ] Atualizações mensais de dependências
- [ ] Avaliações trimestrais de segurança
- [ ] Teste de penetração anual
- [ ] Teste regular de backups
- [ ] Treinamento de conscientização de segurança
- [ ] Simulações de resposta a incidentes

## Conformidade e Padrões

### Conformidade OWASP Top 10

1. **A01:2021 – Broken Access Control** ✅ Endereçado pelo AuthSystem
2. **A02:2021 – Cryptographic Failures** ✅ Criptografia forte utilizada
3. **A03:2021 – Injection** ✅ Sanitização de entrada implementada
4. **A04:2021 – Insecure Design** ✅ Abordagem de segurança por design
5. **A05:2021 – Security Misconfiguration** ✅ Defaults seguros
6. **A06:2021 – Vulnerable Components** ✅ Atualizações regulares
7. **A07:2021 – Identity/Auth Failures** ✅ Sistema de auth robusto
8. **A08:2021 – Software/Data Integrity** ✅ Verificações de integridade
9. **A09:2021 – Logging/Monitoring Failures** ✅ Logging abrangente
10. **A10:2021 – Server-Side Request Forgery** ✅ Validação de URL

### Padrões da Indústria

- **ISO 27001** - Gerenciamento de segurança da informação
- **SOC 2** - Segurança, disponibilidade e confidencialidade
- **GDPR** - Proteção de dados e privacidade
- **HIPAA** - Proteção de dados de saúde (se aplicável)

## Suporte e Recursos

### Documentação
- [Guia de Segurança OWASP](https://owasp.org/www-project-top-ten/)
- [Melhores Práticas de Segurança Node.js](https://nodejs.org/en/docs/guides/security/)
- [Guia de Segurança Express](https://expressjs.com/en/advanced/best-practice-security.html)

### Ferramentas
- [npm audit](https://docs.npmjs.com/cli/v6/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [ESLint Security Plugin](https://github.com/nodesecurity/eslint-plugin-security)
- [Helmet.js](https://helmetjs.github.io/)

### Treinamento
- Treinamento de Segurança OWASP
- Certificação de Segurança Node.js
- Melhores Práticas de Segurança em Cloud
- Treinamento de Resposta a Incidentes

---

**Lembre-se**: Segurança não é uma implementação única, mas um processo contínuo. Revisões, atualizações e melhorias regulares são essenciais para manter um sistema seguro.

Para dúvidas ou preocupações de segurança, abra uma issue em: https://github.com/SynkraAI/aiox-core/issues
