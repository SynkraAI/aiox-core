<!-- Traduccion: ES | Original: /docs/en/api/squads-api.md | Sincronizacion: 2026-01-26 -->

# Referencia de la API de Squads

API REST para sincronizar squads con Synkra y descubrir squads del marketplace.

## Vision General

La API de Squads permite:

- **Sync**: Enviar squads locales a la nube de Synkra
- **Marketplace**: Descubrir y explorar squads publicos
- **Gestion**: Actualizar visibilidad, eliminar squads

**URL Base**: `https://api.synkra.ai`

## Autenticacion

Todos los endpoints autenticados requieren:

### Clave API (Recomendado para CLI)

```bash
Authorization: Bearer sk_tu_clave_api
```

### Token JWT (Aplicaciones web)

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Obtiene tu clave API de: https://synkra.ai/settings/api-keys

## Endpoints

### Sincronizar Squad

Envia una definicion de squad a Synkra.

```
POST /api/squads/sync
```

**Autenticacion**: Requerida

**Cuerpo de la Solicitud**:

| Campo                   | Tipo    | Requerido | Descripcion                                        |
| ----------------------- | ------- | --------- | -------------------------------------------------- |
| `squadData`             | object  | Si        | Datos del manifiesto del squad                     |
| `squadData.name`        | string  | Si        | Nombre del squad                                   |
| `squadData.version`     | string  | Si        | Version semantica                                  |
| `squadData.description` | string  | No        | Descripcion del squad                              |
| `squadData.author`      | string  | No        | Nombre del autor                                   |
| `squadData.components`  | object  | No        | Componentes del squad                              |
| `isPublic`              | boolean | No        | Hacer visible publicamente (predeterminado: false) |
| `isOfficial`            | boolean | No        | Marcar como oficial (solo admin)                   |

**Ejemplo de Solicitud**:

```bash
curl -X POST https://api.synkra.ai/api/squads/sync \
  -H "Authorization: Bearer sk_tu_clave_api" \
  -H "Content-Type: application/json" \
  -d '{
    "squadData": {
      "name": "mi-squad",
      "version": "1.0.0",
      "description": "Mi squad increible",
      "aiox": {
        "minVersion": "2.1.0",
        "type": "squad"
      },
      "components": {
        "agents": ["greeter-agent"],
        "tasks": ["greet-user"]
      }
    },
    "isPublic": true
  }'
```

**Respuesta Exitosa** (200):

```json
{
  "success": true,
  "data": {
    "squad_id": "mi-squad",
    "action": "created",
    "version": "1.0.0",
    "is_public": true
  },
  "duration_ms": 45
}
```

**Respuesta de Error** (400):

```json
{
  "success": false,
  "error": "Validacion fallida: nombre es requerido"
}
```

---

### Sincronizacion por Lotes

Sincroniza multiples squads en una solicitud.

```
POST /api/squads/sync/batch
```

**Autenticacion**: Requerida

**Cuerpo de la Solicitud**:

| Campo      | Tipo    | Requerido | Descripcion                                             |
| ---------- | ------- | --------- | ------------------------------------------------------- |
| `squads`   | array   | Si        | Array de objetos de datos de squad                      |
| `isPublic` | boolean | No        | Hacer todos los squads publicos (predeterminado: false) |

**Ejemplo de Solicitud**:

```bash
curl -X POST https://api.synkra.ai/api/squads/sync/batch \
  -H "Authorization: Bearer sk_tu_clave_api" \
  -H "Content-Type: application/json" \
  -d '{
    "squads": [
      {
        "name": "squad-uno",
        "version": "1.0.0",
        "description": "Primer squad"
      },
      {
        "name": "squad-dos",
        "version": "2.0.0",
        "description": "Segundo squad"
      }
    ],
    "isPublic": false
  }'
```

**Respuesta Exitosa** (200):

```json
{
  "success": true,
  "data": {
    "total": 2,
    "created": 2,
    "updated": 0,
    "skipped": 0,
    "failed": 0,
    "errors": [],
    "duration_ms": 120
  }
}
```

**Respuesta de Falla Parcial** (200):

```json
{
  "success": false,
  "data": {
    "total": 2,
    "created": 1,
    "updated": 0,
    "skipped": 0,
    "failed": 1,
    "errors": [
      {
        "index": 1,
        "squad_name": "squad-dos",
        "error": "Validacion fallida: version es requerida"
      }
    ],
    "duration_ms": 85
  }
}
```

---

### Listar Squads Publicos (Marketplace)

Explora los squads disponibles en el marketplace.

```
GET /api/squads
```

**Autenticacion**: Opcional

**Parametros de Consulta**:

| Parametro  | Tipo    | Predeterminado | Descripcion                       |
| ---------- | ------- | -------------- | --------------------------------- |
| `page`     | number  | 1              | Numero de pagina                  |
| `limit`    | number  | 20             | Items por pagina (max: 100)       |
| `tags`     | string  | -              | Filtro de tags separados por coma |
| `author`   | string  | -              | Filtrar por autor                 |
| `search`   | string  | -              | Buscar en nombre/descripcion      |
| `official` | boolean | -              | Filtrar solo squads oficiales     |

**Ejemplo de Solicitud**:

```bash
# Listar todos los squads publicos
curl https://api.synkra.ai/api/squads

# Buscar con filtros
curl "https://api.synkra.ai/api/squads?tags=devops,automation&search=deploy&official=true&limit=10"
```

**Respuesta Exitosa** (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "squad_id": "devops-squad",
      "name": "devops-squad",
      "version": "2.1.0",
      "description": "Squad de automatizacion DevOps",
      "author": "SynkraAI",
      "tags": ["devops", "automation", "ci-cd"],
      "is_public": true,
      "is_official": true,
      "created_at": "2025-12-01T10:00:00Z",
      "updated_at": "2025-12-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasMore": true
  }
}
```

---

### Listar Mis Squads

Lista squads propiedad de tu workspace.

```
GET /api/squads/mine
```

**Autenticacion**: Requerida

**Parametros de Consulta**:

| Parametro | Tipo   | Predeterminado | Descripcion      |
| --------- | ------ | -------------- | ---------------- |
| `page`    | number | 1              | Numero de pagina |
| `limit`   | number | 20             | Items por pagina |

**Ejemplo de Solicitud**:

```bash
curl https://api.synkra.ai/api/squads/mine \
  -H "Authorization: Bearer sk_tu_clave_api"
```

**Respuesta Exitosa** (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "squad_id": "mi-squad-privado",
      "name": "mi-squad-privado",
      "version": "1.0.0",
      "description": "Mi squad interno",
      "is_public": false,
      "is_official": false,
      "sync_status": "synced",
      "last_synced_at": "2025-12-20T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1,
    "hasMore": false
  }
}
```

---

### Obtener Detalles del Squad

Obtiene informacion detallada sobre un squad especifico.

```
GET /api/squads/:id
```

**Autenticacion**: Opcional (requerida para squads privados)

**Parametros de Ruta**:

| Parametro | Tipo   | Descripcion               |
| --------- | ------ | ------------------------- |
| `id`      | string | UUID del squad o squad_id |

**Ejemplo de Solicitud**:

```bash
# Por squad_id
curl https://api.synkra.ai/api/squads/devops-squad

# Por UUID
curl https://api.synkra.ai/api/squads/550e8400-e29b-41d4-a716-446655440000
```

**Respuesta Exitosa** (200):

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "squad_id": "devops-squad",
    "name": "devops-squad",
    "version": "2.1.0",
    "description": "Squad de automatizacion DevOps para pipelines CI/CD",
    "author": "SynkraAI",
    "license": "MIT",
    "slash_prefix": "devops",
    "tags": ["devops", "automation", "ci-cd"],
    "is_public": true,
    "is_official": true,
    "manifest": {
      "name": "devops-squad",
      "version": "2.1.0",
      "aiox": {
        "minVersion": "2.1.0",
        "type": "squad"
      },
      "components": {
        "agents": ["deploy-agent", "monitor-agent"],
        "tasks": ["deploy-app", "check-health"]
      }
    },
    "created_at": "2025-12-01T10:00:00Z",
    "updated_at": "2025-12-15T14:30:00Z"
  }
}
```

**Respuesta de Error** (404):

```json
{
  "success": false,
  "error": "Squad no encontrado"
}
```

---

### Actualizar Squad

Actualiza la configuracion de visibilidad del squad.

```
PATCH /api/squads/:id
```

**Autenticacion**: Requerida (solo propietario)

**Parametros de Ruta**:

| Parametro | Tipo   | Descripcion               |
| --------- | ------ | ------------------------- |
| `id`      | string | UUID del squad o squad_id |

**Cuerpo de la Solicitud**:

| Campo      | Tipo    | Descripcion                    |
| ---------- | ------- | ------------------------------ |
| `isPublic` | boolean | Establecer visibilidad publica |

**Ejemplo de Solicitud**:

```bash
curl -X PATCH https://api.synkra.ai/api/squads/mi-squad \
  -H "Authorization: Bearer sk_tu_clave_api" \
  -H "Content-Type: application/json" \
  -d '{"isPublic": true}'
```

**Respuesta Exitosa** (200):

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "squad_id": "mi-squad",
    "name": "mi-squad",
    "is_public": true,
    "updated_at": "2025-12-26T10:00:00Z"
  }
}
```

---

### Eliminar Squad

Elimina un squad de Synkra.

```
DELETE /api/squads/:id
```

**Autenticacion**: Requerida (solo propietario)

**Parametros de Ruta**:

| Parametro | Tipo   | Descripcion               |
| --------- | ------ | ------------------------- |
| `id`      | string | UUID del squad o squad_id |

**Ejemplo de Solicitud**:

```bash
curl -X DELETE https://api.synkra.ai/api/squads/mi-squad-antiguo \
  -H "Authorization: Bearer sk_tu_clave_api"
```

**Respuesta Exitosa** (200):

```json
{
  "success": true,
  "message": "Squad eliminado exitosamente"
}
```

---

### Validar Squad

Valida datos del squad sin persistir.

```
POST /api/squads/validate
```

**Autenticacion**: Opcional

**Cuerpo de la Solicitud**:

| Campo       | Tipo   | Requerido | Descripcion                    |
| ----------- | ------ | --------- | ------------------------------ |
| `squadData` | object | Si        | Manifiesto del squad a validar |

**Ejemplo de Solicitud**:

```bash
curl -X POST https://api.synkra.ai/api/squads/validate \
  -H "Content-Type: application/json" \
  -d '{
    "squadData": {
      "name": "test-squad",
      "version": "1.0.0"
    }
  }'
```

**Respuesta Exitosa** (200):

```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": ["Falta campo recomendado: description", "Falta campo aiox.minVersion"]
  }
}
```

**Respuesta de Falla de Validacion** (200):

```json
{
  "success": false,
  "data": {
    "valid": false,
    "errors": ["nombre es requerido", "version debe ser semver valido"],
    "warnings": []
  }
}
```

---

## Codigos de Error

| Codigo HTTP | Significado                                       |
| ----------- | ------------------------------------------------- |
| 200         | Exito                                             |
| 400         | Solicitud Incorrecta - Entrada invalida           |
| 401         | No Autorizado - Autenticacion faltante o invalida |
| 403         | Prohibido - Permisos insuficientes                |
| 404         | No Encontrado - El squad no existe                |
| 500         | Error Interno del Servidor                        |

### Formato de Respuesta de Error

```json
{
  "success": false,
  "error": "Mensaje de error legible"
}
```

---

## Limites de Tasa

| Plan       | Solicitudes/min | Solicitudes/dia |
| ---------- | --------------- | --------------- |
| Gratis     | 60              | 1,000           |
| Pro        | 300             | 10,000          |
| Enterprise | Ilimitado       | Ilimitado       |

Headers de limite de tasa:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1703577600
```

---

## Integracion CLI

El comando `*sync-squad-synkra` usa esta API:

```bash
# Sincronizar squad individual
@squad-creator
*sync-squad-synkra ./squads/mi-squad --public

# Sincronizacion por lotes de todos los squads
*sync-squad-synkra ./squads/* --public
```

Configurar clave API:

```bash
export SYNKRA_API_TOKEN="sk_tu_clave_api"
```

---

## Coleccion Postman

Importa esta coleccion en Postman o Insomnia:

```json
{
  "info": {
    "name": "API de Squads Synkra",
    "description": "API REST para el Marketplace de Squads de Synkra",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://api.synkra.ai"
    },
    {
      "key": "apiKey",
      "value": "sk_tu_clave_api"
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{apiKey}}"
      }
    ]
  },
  "item": [
    {
      "name": "Sync",
      "item": [
        {
          "name": "Sincronizar Squad",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/squads/sync",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"squadData\": {\n    \"name\": \"mi-squad\",\n    \"version\": \"1.0.0\",\n    \"description\": \"Mi squad\",\n    \"aiox\": {\n      \"minVersion\": \"2.1.0\",\n      \"type\": \"squad\"\n    }\n  },\n  \"isPublic\": false\n}"
            }
          }
        },
        {
          "name": "Sincronizacion por Lotes",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/squads/sync/batch",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"squads\": [\n    {\"name\": \"squad-1\", \"version\": \"1.0.0\"},\n    {\"name\": \"squad-2\", \"version\": \"1.0.0\"}\n  ],\n  \"isPublic\": false\n}"
            }
          }
        }
      ]
    },
    {
      "name": "Marketplace",
      "item": [
        {
          "name": "Listar Squads Publicos",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{baseUrl}}/api/squads?page=1&limit=20",
              "query": [
                { "key": "page", "value": "1" },
                { "key": "limit", "value": "20" },
                { "key": "tags", "value": "devops", "disabled": true },
                { "key": "search", "value": "", "disabled": true },
                { "key": "official", "value": "true", "disabled": true }
              ]
            }
          }
        },
        {
          "name": "Obtener Detalles del Squad",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/squads/devops-squad"
          }
        }
      ]
    },
    {
      "name": "Gestion",
      "item": [
        {
          "name": "Listar Mis Squads",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/squads/mine"
          }
        },
        {
          "name": "Actualizar Visibilidad del Squad",
          "request": {
            "method": "PATCH",
            "url": "{{baseUrl}}/api/squads/mi-squad",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"isPublic\": true\n}"
            }
          }
        },
        {
          "name": "Eliminar Squad",
          "request": {
            "method": "DELETE",
            "url": "{{baseUrl}}/api/squads/mi-squad"
          }
        }
      ]
    },
    {
      "name": "Validacion",
      "item": [
        {
          "name": "Validar Squad",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/squads/validate",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"squadData\": {\n    \"name\": \"test-squad\",\n    \"version\": \"1.0.0\"\n  }\n}"
            }
          }
        }
      ]
    }
  ]
}
```

Guarda el JSON anterior como `synkra-squads-api.postman_collection.json` e importa en Postman.

---

## Recursos Relacionados

- [Guia de Desarrollo de Squads](../guides/squads-guide.md)
- [Contribuir Squads](../guides/contributing-squads.md)
- [Agente @squad-creator](../../../.aiox-core/development/agents/squad-creator.md)

---

**Version:** 1.0.0 | **Actualizado:** 2025-12-26 | **Story:** SQS-8
