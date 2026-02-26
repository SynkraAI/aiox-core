<!--
  Traducción: ES
  Original: /docs/en/security-best-practices.md
  Última sincronización: 2026-01-26
-->

# Mejores Prácticas de Seguridad de Synkra AIOS

> 🌐 [EN](../security-best-practices.md) | [PT](../pt/security-best-practices.md) | **ES**

---

Esta guía proporciona recomendaciones de seguridad completas para desplegar y mantener Synkra AIOS en entornos de producción.

## Tabla de Contenidos

1. [Descripción General de la Arquitectura de Seguridad](#descripción-general-de-la-arquitectura-de-seguridad)
2. [Autenticación y Autorización](#autenticación-y-autorización)
3. [Validación y Sanitización de Entrada](#validación-y-sanitización-de-entrada)
4. [Limitación de Tasa y Protección contra DOS](#limitación-de-tasa-y-protección-contra-dos)
5. [Configuración Segura](#configuración-segura)
6. [Protección de Datos](#protección-de-datos)
7. [Registro y Monitoreo](#registro-y-monitoreo)
8. [Seguridad de Red](#seguridad-de-red)
9. [Gestión de Dependencias](#gestión-de-dependencias)
10. [Respuesta a Incidentes](#respuesta-a-incidentes)

## Descripción General de la Arquitectura de Seguridad

Synkra AIOS implementa un enfoque de seguridad multicapa:

```
┌─────────────────────────────────────────┐
│           Capa de Aplicación            │
├─────────────────────────────────────────┤
│         Capa de Autenticación           │
├─────────────────────────────────────────┤
│       Capa de Validación de Entrada     │
├─────────────────────────────────────────┤
│        Capa de Limitación de Tasa       │
├─────────────────────────────────────────┤
│            Capa de Red                  │
└─────────────────────────────────────────┘
```

### Módulos de Seguridad Principales

- **InputSanitizer**: Previene ataques de inyección y traversal de directorios
- **AuthSystem**: Autenticación basada en JWT con gestión de sesiones
- **RateLimiter**: Protección contra DOS y prevención de abuso
- **SecurityAudit**: Escaneo automatizado de vulnerabilidades

## Autenticación y Autorización

### Implementación

```javascript
const AuthSystem = require('./security/auth');

const auth = new AuthSystem({
  secretKey: process.env.JWT_SECRET,
  tokenExpiry: '1h',
  refreshExpiry: '7d'
});

// Crear usuario con requisitos de contraseña fuerte
await auth.createUser({
  username: 'admin',
  password: 'SecureP@ssw0rd123!',
  email: 'admin@example.com',
  role: 'admin'
});
```

### Mejores Prácticas

1. **Política de Contraseña Fuerte**
   - Mínimo 12 caracteres
   - Combinación de mayúsculas, minúsculas, números y símbolos
   - Sin palabras del diccionario o información personal

2. **Gestión de Tokens**
   - Tokens de acceso de corta duración (1 hora)
   - Rotación segura de refresh tokens
   - Revocación inmediata al cerrar sesión

3. **Seguridad de Sesión**
   - Almacenamiento seguro de sesiones
   - Tiempo de espera de sesión por inactividad
   - Gestión de múltiples sesiones

4. **Protección de Cuenta**
   - Bloqueo de cuenta después de intentos fallidos
   - Retrasos progresivos en fallos de autenticación
   - Notificaciones por correo electrónico para eventos de seguridad

### Configuración

```env
# .env - Configuración de autenticación
JWT_SECRET=your-super-secure-random-key-here
AUTH_TOKEN_EXPIRY=1h
AUTH_REFRESH_EXPIRY=7d
AUTH_MAX_LOGIN_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=15m
```

## Validación y Sanitización de Entrada

### Siempre Sanitice la Entrada del Usuario

```javascript
const InputSanitizer = require('./security/sanitizer');

// Sanitización de rutas
const safePath = InputSanitizer.sanitizePath(userInput, basePath);

// Validación de nombre de proyecto
const safeProjectName = InputSanitizer.sanitizeProjectName(name);

// Sanitización de comandos
const safeCommand = InputSanitizer.sanitizeCommand(userCommand);

// Valores de configuración
const safeValue = InputSanitizer.sanitizeConfigValue(value, 'string');
```

### Reglas de Validación

1. **Operaciones de Ruta**
   - Siempre use rutas absolutas
   - Prevenir traversal de directorios (../)
   - Validar contra directorios permitidos
   - Verificar patrones sospechosos

2. **Ejecución de Comandos**
   - Lista blanca de caracteres permitidos
   - Eliminar separadores de comandos (;, |, &)
   - Limitar longitud de comandos
   - Usar ejecución parametrizada

3. **Datos de Configuración**
   - Validación de tipos
   - Restricciones de longitud
   - Coincidencia de patrones
   - Validación de enumeraciones donde sea aplicable

### Vulnerabilidades Comunes a Prevenir

- **Path Traversal**: `../../../etc/passwd`
- **Inyección de Comandos**: `; rm -rf /`
- **Inyección SQL**: `'; DROP TABLE users; --`
- **XSS**: `<script>alert('xss')</script>`
- **Prototype Pollution**: `{"__proto__": {"admin": true}}`

## Limitación de Tasa y Protección contra DOS

### Implementación

```javascript
const { RateLimiters } = require('./security/rate-limiter');

// Diferentes limitadores para diferentes operaciones
const apiLimiter = RateLimiters.createApiLimiter();
const authLimiter = RateLimiters.createAuthLimiter();
const metaAgentLimiter = RateLimiters.createMetaAgentLimiter();

// Verificar antes de la operación
const identifier = RateLimiter.createIdentifier({
  ip: req.ip,
  userId: req.user?.id,
  operation: 'meta-agent'
});

const result = metaAgentLimiter.check(identifier);
if (!result.allowed) {
  throw new Error(`Límite de tasa excedido. Reintentar después de ${result.retryAfter} segundos`);
}
```

### Estrategia de Limitación de Tasa

| Operación | Ventana | Límite | Propósito |
|-----------|---------|--------|-----------|
| Llamadas API | 15 min | 1000 | Protección general de API |
| Autenticación | 15 min | 5 | Prevención de fuerza bruta |
| Instalación | 1 hora | 10 | Prevención de abuso de instalación |
| Meta-Agent | 1 min | 30 | Protección de recursos |
| Operaciones de Archivos | 1 min | 100 | Protección del sistema de archivos |

### Configuración

```env
# Configuración de limitación de tasa
RATE_LIMIT_API_WINDOW=900000
RATE_LIMIT_API_MAX=1000
RATE_LIMIT_AUTH_WINDOW=900000
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_INSTALL_WINDOW=3600000
RATE_LIMIT_INSTALL_MAX=10
```

## Configuración Segura

### Variables de Entorno

```env
# Configuración de seguridad requerida
NODE_ENV=production
JWT_SECRET=your-256-bit-secret-key
DATABASE_ENCRYPTION_KEY=your-database-encryption-key
SESSION_SECRET=your-session-secret

# Claves API (¡nunca las codifique directamente!)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-your-anthropic-key

# Headers de seguridad
SECURITY_HEADERS_ENABLED=true
HELMET_ENABLED=true
CORS_ORIGIN=https://yourdomain.com

# Registro de auditoría
AUDIT_LOG_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_LOG_FILE=/var/log/aios/audit.log
```

### Permisos de Archivos

```bash
# Permisos de archivos seguros
chmod 600 .env
chmod 600 .aios/config.json
chmod 600 .aios/users.json
chmod 600 .aios/sessions.json
chmod 700 .aios/
chmod 700 security/
```

### Validación de Configuración

```javascript
// Validar configuración crítica al inicio
const requiredEnvVars = [
  'JWT_SECRET',
  'NODE_ENV'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Falta variable de entorno requerida: ${envVar}`);
  }
}

// Validar fortaleza del JWT secret
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
}
```

## Protección de Datos

### Cifrado en Reposo

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

### Manejo de Datos Sensibles

1. **Claves API**
   - Almacenar solo en variables de entorno
   - Nunca registrar o exponer en mensajes de error
   - Rotar regularmente
   - Usar claves separadas para diferentes entornos

2. **Datos de Usuario**
   - Hashear contraseñas con bcrypt (salt rounds >= 12)
   - Cifrar PII en reposo
   - Implementar políticas de retención de datos
   - Soportar solicitudes de eliminación de datos

3. **Datos de Sesión**
   - Usar almacenamiento de sesión seguro
   - Implementar tiempo de espera de sesión
   - Limpiar sesiones al cerrar sesión
   - Monitorear secuestro de sesiones

## Registro y Monitoreo

### Registro de Eventos de Seguridad

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

// Registrar eventos de seguridad
securityLogger.warn('Falló autenticación', {
  username: req.body.username,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
});
```

### Eventos a Monitorear

- Intentos de autenticación fallidos
- Violaciones de límite de tasa
- Patrones de acceso a archivos sospechosos
- Cambios de configuración
- Intentos de escalación de permisos
- Patrones de uso de API inusuales

### Umbrales de Alerta

```javascript
const alertThresholds = {
  failedLogins: 10, // por hora
  rateLimitViolations: 50, // por hora
  suspiciousFileAccess: 5, // por hora
  configChanges: 1, // cualquier cambio
  errorRate: 0.05 // 5% tasa de error
};
```

## Seguridad de Red

### Configuración HTTPS

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem'),
  // Mejoras de seguridad
  secureProtocol: 'TLSv1_2_method',
  ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
  honorCipherOrder: true
};

https.createServer(options, app).listen(443);
```

### Headers de Seguridad

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

### Configuración CORS

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Gestión de Dependencias

### Escaneo de Seguridad

```bash
# Auditorías de seguridad regulares
npm audit
npm audit fix

# Usando yarn
yarn audit
yarn audit fix

# Escaneo avanzado con snyk
npx snyk test
npx snyk monitor
```

### Estrategia de Actualización

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

### Actualizaciones Automáticas de Dependencias

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

## Respuesta a Incidentes

### Procedimientos de Respuesta

1. **Detección**
   - Monitorear logs de seguridad
   - Configurar alertas automatizadas
   - Auditorías de seguridad regulares

2. **Evaluación**
   - Determinar alcance e impacto
   - Identificar sistemas afectados
   - Clasificar severidad del incidente

3. **Contención**
   - Aislar sistemas afectados
   - Revocar credenciales comprometidas
   - Bloquear tráfico malicioso

4. **Recuperación**
   - Restaurar desde backups limpios
   - Aplicar parches de seguridad
   - Actualizar medidas de seguridad

5. **Lecciones Aprendidas**
   - Documentar detalles del incidente
   - Actualizar procedimientos de seguridad
   - Mejorar monitoreo

### Contactos de Emergencia

```javascript
// Configuración de respuesta de emergencia
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

## Lista de Verificación de Seguridad

### Pre-Despliegue

- [ ] Todos los módulos de seguridad implementados
- [ ] Sanitización de entrada en su lugar
- [ ] Limitación de tasa configurada
- [ ] Sistema de autenticación probado
- [ ] Auditoría de seguridad completada
- [ ] Pruebas de penetración realizadas
- [ ] Certificados SSL/TLS instalados
- [ ] Headers de seguridad configurados
- [ ] Registro y monitoreo activo
- [ ] Plan de respuesta a incidentes listo

### Post-Despliegue

- [ ] Escaneos de seguridad regulares programados
- [ ] Actualizaciones de dependencias automatizadas
- [ ] Monitoreo de logs activo
- [ ] Procedimientos de backup probados
- [ ] Controles de acceso revisados
- [ ] Capacitación de seguridad completada
- [ ] Documentación actualizada

### Mantenimiento Continuo

- [ ] Revisión semanal de logs de seguridad
- [ ] Actualizaciones mensuales de dependencias
- [ ] Evaluaciones de seguridad trimestrales
- [ ] Pruebas de penetración anuales
- [ ] Pruebas de backup regulares
- [ ] Capacitación de concientización de seguridad
- [ ] Simulacros de respuesta a incidentes

## Cumplimiento y Estándares

### Cumplimiento OWASP Top 10

1. **A01:2021 – Control de Acceso Roto** ✅ Abordado por AuthSystem
2. **A02:2021 – Fallas Criptográficas** ✅ Cifrado fuerte utilizado
3. **A03:2021 – Inyección** ✅ Sanitización de entrada implementada
4. **A04:2021 – Diseño Inseguro** ✅ Enfoque de seguridad por diseño
5. **A05:2021 – Configuración de Seguridad Incorrecta** ✅ Valores seguros por defecto
6. **A06:2021 – Componentes Vulnerables** ✅ Actualizaciones regulares
7. **A07:2021 – Fallas de Identidad/Autenticación** ✅ Sistema de autenticación robusto
8. **A08:2021 – Integridad de Software/Datos** ✅ Verificaciones de integridad
9. **A09:2021 – Fallas de Registro/Monitoreo** ✅ Registro completo
10. **A10:2021 – Falsificación de Solicitudes del Lado del Servidor** ✅ Validación de URL

### Estándares de la Industria

- **ISO 27001** - Gestión de seguridad de la información
- **SOC 2** - Seguridad, disponibilidad y confidencialidad
- **GDPR** - Protección de datos y privacidad
- **HIPAA** - Protección de datos de salud (si aplica)

## Soporte y Recursos

### Documentación
- [Guía de Seguridad OWASP](https://owasp.org/www-project-top-ten/)
- [Mejores Prácticas de Seguridad de Node.js](https://nodejs.org/en/docs/guides/security/)
- [Guía de Seguridad de Express](https://expressjs.com/en/advanced/best-practice-security.html)

### Herramientas
- [npm audit](https://docs.npmjs.com/cli/v6/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [ESLint Security Plugin](https://github.com/nodesecurity/eslint-plugin-security)
- [Helmet.js](https://helmetjs.github.io/)

### Capacitación
- Capacitación de Seguridad OWASP
- Certificación de Seguridad de Node.js
- Mejores Prácticas de Seguridad en la Nube
- Capacitación en Respuesta a Incidentes

---

**Recuerde**: La seguridad no es una implementación única sino un proceso continuo. Las revisiones, actualizaciones y mejoras regulares son esenciales para mantener un sistema seguro.

Para preguntas o inquietudes de seguridad, abra un issue en: https://github.com/SynkraAI/aios-core/issues
