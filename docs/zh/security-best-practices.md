# Synkra AIOX 安全最佳实践

> 🌐 [EN](../security-best-practices.md) | [PT](../pt/security-best-practices.md) | [ES](../es/security-best-practices.md)

---

本指南为在生产环境中部署和维护 Synkra AIOX 提供了全面的安全建议。

## 目录

1. [安全架构概述](#安全架构概述)
2. [身份验证和授权](#身份验证和授权)
3. [输入验证和清理](#输入验证和清理)
4. [速率限制和 DOS 防护](#速率限制和-dos-防护)
5. [安全配置](#安全配置)
6. [数据保护](#数据保护)
7. [日志记录和监控](#日志记录和监控)
8. [网络安全](#网络安全)
9. [依赖管理](#依赖管理)
10. [事件响应](#事件响应)

## 安全架构概述

Synkra AIOX 实现了多层安全方法：

```
┌─────────────────────────────────────────┐
│           应用层                        │
├─────────────────────────────────────────┤
│         身份验证层                      │
├─────────────────────────────────────────┤
│        输入验证层                       │
├─────────────────────────────────────────┤
│         速率限制层                      │
├─────────────────────────────────────────┤
│           网络层                        │
└─────────────────────────────────────────┘
```

### 核心安全模块

- **InputSanitizer**: 防止注入攻击和路径遍历
- **AuthSystem**: 基于 JWT 的身份验证和会话管理
- **RateLimiter**: DOS 防护和滥用防止
- **SecurityAudit**: 自动漏洞扫描

## 身份验证和授权

### 实现

```javascript
const AuthSystem = require('./security/auth');

const auth = new AuthSystem({
  secretKey: process.env.JWT_SECRET,
  tokenExpiry: '1h',
  refreshExpiry: '7d'
});

// 使用强密码要求创建用户
await auth.createUser({
  username: 'admin',
  password: 'SecureP@ssw0rd123!',
  email: 'admin@example.com',
  role: 'admin'
});
```

### 最佳实践

1. **强密码策略**
   - 最少 12 个字符
   - 包含大小写字母、数字、符号
   - 不包含字典单词或个人信息

2. **令牌管理**
   - 短期访问令牌（1 小时）
   - 安全的刷新令牌轮换
   - 登出时立即撤销

3. **会话安全**
   - 安全的会话存储
   - 非活动后会话超时
   - 多会话管理

4. **账户保护**
   - 多次失败尝试后账户锁定
   - 身份验证失败后逐步延迟
   - 安全事件的电子邮件通知

### 配置

```env
# .env - 身份验证设置
JWT_SECRET=your-super-secure-random-key-here
AUTH_TOKEN_EXPIRY=1h
AUTH_REFRESH_EXPIRY=7d
AUTH_MAX_LOGIN_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=15m
```

## 输入验证和清理

### 始终清理用户输入

```javascript
const InputSanitizer = require('./security/sanitizer');

// 路径清理
const safePath = InputSanitizer.sanitizePath(userInput, basePath);

// 项目名称验证
const safeProjectName = InputSanitizer.sanitizeProjectName(name);

// 命令清理
const safeCommand = InputSanitizer.sanitizeCommand(userCommand);

// 配置值
const safeValue = InputSanitizer.sanitizeConfigValue(value, 'string');
```

### 验证规则

1. **路径操作**
   - 始终使用绝对路径
   - 防止目录遍历 (../)
   - 验证允许的目录
   - 检查可疑模式

2. **命令执行**
   - 白名单允许的字符
   - 移除命令分隔符 (;, |, &)
   - 限制命令长度
   - 使用参数化执行

3. **配置数据**
   - 类型验证
   - 长度限制
   - 模式匹配
   - 枚举验证

### 常见漏洞防护

- **路径遍历**: `../../../etc/passwd`
- **命令注入**: `; rm -rf /`
- **SQL 注入**: `'; DROP TABLE users; --`
- **XSS**: `<script>alert('xss')</script>`
- **原型污染**: `{"__proto__": {"admin": true}}`

## 速率限制和 DOS 防护

### 实现

```javascript
const { RateLimiters } = require('./security/rate-limiter');

// 不同操作的不同限制器
const apiLimiter = RateLimiters.createApiLimiter();
const authLimiter = RateLimiters.createAuthLimiter();
const metaAgentLimiter = RateLimiters.createMetaAgentLimiter();

// 操作前检查
const identifier = RateLimiter.createIdentifier({
  ip: req.ip,
  userId: req.user?.id,
  operation: 'meta-agent'
});

const result = metaAgentLimiter.check(identifier);
if (!result.allowed) {
  throw new Error(`速率限制已超出。请在 ${result.retryAfter} 秒后重试`);
}
```

### 速率限制策略

| 操作 | 时间窗口 | 限制 | 目的 |
|------|---------|------|------|
| API 调用 | 15 分钟 | 1000 | 通用 API 保护 |
| 身份验证 | 15 分钟 | 5 | 暴力破解防护 |
| 安装 | 1 小时 | 10 | 安装滥用防护 |
| 元代理 | 1 分钟 | 30 | 资源保护 |
| 文件操作 | 1 分钟 | 100 | 文件系统保护 |

### 配置

```env
# 速率限制设置
RATE_LIMIT_API_WINDOW=900000
RATE_LIMIT_API_MAX=1000
RATE_LIMIT_AUTH_WINDOW=900000
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_INSTALL_WINDOW=3600000
RATE_LIMIT_INSTALL_MAX=10
```

## 安全配置

### 环境变量

```env
# 所需的安全设置
NODE_ENV=production
JWT_SECRET=your-256-bit-secret-key
DATABASE_ENCRYPTION_KEY=your-database-encryption-key
SESSION_SECRET=your-session-secret

# API 密钥（永远不要硬编码！）
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-your-anthropic-key

# 安全头部
SECURITY_HEADERS_ENABLED=true
HELMET_ENABLED=true
CORS_ORIGIN=https://yourdomain.com

# 审计日志
AUDIT_LOG_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_LOG_FILE=/var/log/aiox/audit.log
```

### 文件权限

```bash
# 安全文件权限
chmod 600 .env
chmod 600 .aiox/config.json
chmod 600 .aiox/users.json
chmod 600 .aiox/sessions.json
chmod 700 .aiox/
chmod 700 security/
```

### 配置验证

```javascript
// 启动时验证关键配置
const requiredEnvVars = [
  'JWT_SECRET',
  'NODE_ENV'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`缺少必需的环境变量: ${envVar}`);
  }
}

// 验证 JWT 密钥强度
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET 必须至少 32 个字符长');
}
```

## 数据保护

### 静止数据加密

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

### 敏感数据处理

1. **API 密钥**
   - 仅存储在环境变量中
   - 永远不要记录或在错误消息中暴露
   - 定期轮换
   - 为不同环境使用单独的密钥

2. **用户数据**
   - 使用 bcrypt 进行密码哈希（盐轮数 ≥ 12）
   - 静止时加密 PII
   - 实施数据保留政策
   - 支持数据删除请求

3. **会话数据**
   - 使用安全的会话存储
   - 实施会话超时
   - 登出时清除会话
   - 监控会话劫持

## 日志记录和监控

### 安全事件日志

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

// 记录安全事件
securityLogger.warn('身份验证失败', {
  username: req.body.username,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
});
```

### 监控的事件

- 身份验证失败
- 速率限制违规
- 可疑文件访问模式
- 配置变更
- 权限升级尝试
- 异常 API 使用模式

### 告警阈值

```javascript
const alertThresholds = {
  failedLogins: 10, // 每小时
  rateLimitViolations: 50, // 每小时
  suspiciousFileAccess: 5, // 每小时
  configChanges: 1, // 任何变更
  errorRate: 0.05 // 5% 错误率
};
```

## 网络安全

### HTTPS 配置

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem'),
  // 安全改进
  secureProtocol: 'TLSv1_2_method',
  ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
  honorCipherOrder: true
};

https.createServer(options, app).listen(443);
```

### 安全头部

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

### CORS 配置

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 依赖管理

### 安全扫描

```bash
# 定期安全审计
npm audit
npm audit fix

# 使用 yarn
yarn audit
yarn audit fix

# 使用 snyk 进行高级扫描
npx snyk test
npx snyk monitor
```

### 更新策略

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

### 自动化依赖更新

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

## 事件响应

### 响应程序

1. **检测**
   - 监控安全日志
   - 设置自动化告警
   - 定期安全审计

2. **评估**
   - 确定范围和影响
   - 识别受影响的系统
   - 对事件进行分级

3. **遏制**
   - 隔离受影响的系统
   - 撤销泄露的凭证
   - 阻止恶意流量

4. **恢复**
   - 从干净备份恢复
   - 应用安全补丁
   - 更新安全措施

5. **经验教训**
   - 文件化事件详情
   - 更新安全程序
   - 改进监控

### 紧急联系

```javascript
// 应急响应配置
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

## 安全检查清单

### 部署前

- [ ] 所有安全模块已实现
- [ ] 输入清理已就位
- [ ] 速率限制已配置
- [ ] 身份验证系统已测试
- [ ] 安全审计已完成
- [ ] 渗透测试已执行
- [ ] SSL/TLS 证书已安装
- [ ] 安全头部已配置
- [ ] 日志记录和监控活跃
- [ ] 事件响应计划已准备

### 部署后

- [ ] 定期安全扫描已计划
- [ ] 依赖更新已自动化
- [ ] 日志监控活跃
- [ ] 备份程序已测试
- [ ] 访问控制已审核
- [ ] 安全培训已完成
- [ ] 文档已更新

### 持续维护

- [ ] 每周审查安全日志
- [ ] 每月依赖更新
- [ ] 季度安全评估
- [ ] 年度渗透测试
- [ ] 定期备份测试
- [ ] 安全意识培训
- [ ] 事件响应演练

## 合规性和标准

### OWASP Top 10 合规性

1. **A01:2021 – 访问控制中断** ✅ 由 AuthSystem 寻址
2. **A02:2021 – 密码学故障** ✅ 使用强加密
3. **A03:2021 – 注入** ✅ 已实施输入清理
4. **A04:2021 – 不安全设计** ✅ 安全优先设计方法
5. **A05:2021 – 安全错误配置** ✅ 安全默认设置
6. **A06:2021 – 易受攻击的组件** ✅ 定期更新
7. **A07:2021 – 身份/认证故障** ✅ 强大的身份验证系统
8. **A08:2021 – 软件/数据完整性** ✅ 完整性检查
9. **A09:2021 – 日志/监控故障** ✅ 全面的日志记录
10. **A10:2021 – 服务器端请求伪造** ✅ URL 验证

### 行业标准

- **ISO 27001** - 信息安全管理
- **SOC 2** - 安全、可用性和机密性
- **GDPR** - 数据保护和隐私
- **HIPAA** - 医疗数据保护（如适用）

## 支持和资源

### 文档

- [OWASP 安全指南](https://owasp.org/www-project-top-ten/)
- [Node.js 安全最佳实践](https://nodejs.org/en/docs/guides/security/)
- [Express 安全指南](https://expressjs.com/en/advanced/best-practice-security.html)

### 工具

- [npm audit](https://docs.npmjs.com/cli/v6/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [ESLint Security Plugin](https://github.com/nodesecurity/eslint-plugin-security)
- [Helmet.js](https://helmetjs.github.io/)

### 培训

- OWASP 安全培训
- Node.js 安全认证
- 云安全最佳实践
- 事件响应培训

---

**记住**：安全不是一次性的实现，而是一个持续的过程。定期审查、更新和改进对于维护安全系统至关重要。

如有问题或安全问题，请联系：security@synkra/aiox-core.dev
