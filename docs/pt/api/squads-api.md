<!-- Tradução: PT-BR | Original: /docs/en/api/squads-api.md | Sincronização: 2026-01-26 -->

# Referência da API de Squads

API REST para sincronizar squads com Synkra e descobrir squads do marketplace.

## Visão Geral

A API de Squads permite:

- **Sync**: Enviar squads locais para a nuvem Synkra
- **Marketplace**: Descobrir e navegar squads públicos
- **Gerenciamento**: Atualizar visibilidade, excluir squads

**URL Base**: `https://api.synkra.ai`

## Autenticação

Todos os endpoints autenticados requerem:

### Chave de API (Recomendado para CLI)

```bash
Authorization: Bearer sk_your_api_key
```

### Token JWT (Aplicações web)

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Obtenha sua chave de API em: https://synkra.ai/settings/api-keys

## Endpoints

### Sincronizar Squad

Enviar uma definição de squad para Synkra.

```
POST /api/squads/sync
```

**Autenticação**: Obrigatória

**Corpo da Requisição**:

| Campo                   | Tipo    | Obrigatório | Descrição                                   |
| ----------------------- | ------- | ----------- | ------------------------------------------- |
| `squadData`             | object  | Sim         | Dados do manifesto do squad                 |
| `squadData.name`        | string  | Sim         | Nome do squad                               |
| `squadData.version`     | string  | Sim         | Versão semântica                            |
| `squadData.description` | string  | Não         | Descrição do squad                          |
| `squadData.author`      | string  | Não         | Nome do autor                               |
| `squadData.components`  | object  | Não         | Componentes do squad                        |
| `isPublic`              | boolean | Não         | Tornar publicamente visível (padrão: false) |
| `isOfficial`            | boolean | Não         | Marcar como oficial (apenas admin)          |

**Exemplo de Requisição**:

```bash
curl -X POST https://api.synkra.ai/api/squads/sync \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "squadData": {
      "name": "my-squad",
      "version": "1.0.0",
      "description": "Meu squad incrível",
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

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "data": {
    "squad_id": "my-squad",
    "action": "created",
    "version": "1.0.0",
    "is_public": true
  },
  "duration_ms": 45
}
```

**Resposta de Erro** (400):

```json
{
  "success": false,
  "error": "Validation failed: name is required"
}
```

---

### Sincronização em Lote

Sincronizar múltiplos squads em uma requisição.

```
POST /api/squads/sync/batch
```

**Autenticação**: Obrigatória

**Corpo da Requisição**:

| Campo      | Tipo    | Obrigatório | Descrição                                       |
| ---------- | ------- | ----------- | ----------------------------------------------- |
| `squads`   | array   | Sim         | Array de objetos de dados de squad              |
| `isPublic` | boolean | Não         | Tornar todos os squads públicos (padrão: false) |

**Exemplo de Requisição**:

```bash
curl -X POST https://api.synkra.ai/api/squads/sync/batch \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "squads": [
      {
        "name": "squad-one",
        "version": "1.0.0",
        "description": "Primeiro squad"
      },
      {
        "name": "squad-two",
        "version": "2.0.0",
        "description": "Segundo squad"
      }
    ],
    "isPublic": false
  }'
```

**Resposta de Sucesso** (200):

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

**Resposta de Falha Parcial** (200):

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
        "squad_name": "squad-two",
        "error": "Validation failed: version is required"
      }
    ],
    "duration_ms": 85
  }
}
```

---

### Listar Squads Públicos (Marketplace)

Navegar squads disponíveis no marketplace.

```
GET /api/squads
```

**Autenticação**: Opcional

**Parâmetros de Query**:

| Parâmetro  | Tipo    | Padrão | Descrição                            |
| ---------- | ------- | ------ | ------------------------------------ |
| `page`     | number  | 1      | Número da página                     |
| `limit`    | number  | 20     | Itens por página (máx: 100)          |
| `tags`     | string  | -      | Filtro de tags separadas por vírgula |
| `author`   | string  | -      | Filtrar por autor                    |
| `search`   | string  | -      | Buscar em nome/descrição             |
| `official` | boolean | -      | Filtrar apenas squads oficiais       |

**Exemplo de Requisição**:

```bash
# Listar todos os squads públicos
curl https://api.synkra.ai/api/squads

# Buscar com filtros
curl "https://api.synkra.ai/api/squads?tags=devops,automation&search=deploy&official=true&limit=10"
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "squad_id": "devops-squad",
      "name": "devops-squad",
      "version": "2.1.0",
      "description": "Squad de automação DevOps",
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

### Listar Meus Squads

Listar squads pertencentes ao seu workspace.

```
GET /api/squads/mine
```

**Autenticação**: Obrigatória

**Parâmetros de Query**:

| Parâmetro | Tipo   | Padrão | Descrição        |
| --------- | ------ | ------ | ---------------- |
| `page`    | number | 1      | Número da página |
| `limit`   | number | 20     | Itens por página |

**Exemplo de Requisição**:

```bash
curl https://api.synkra.ai/api/squads/mine \
  -H "Authorization: Bearer sk_your_api_key"
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "squad_id": "my-private-squad",
      "name": "my-private-squad",
      "version": "1.0.0",
      "description": "Meu squad interno",
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

### Obter Detalhes do Squad

Obter informações detalhadas sobre um squad específico.

```
GET /api/squads/:id
```

**Autenticação**: Opcional (obrigatória para squads privados)

**Parâmetros de Path**:

| Parâmetro | Tipo   | Descrição                 |
| --------- | ------ | ------------------------- |
| `id`      | string | UUID do squad ou squad_id |

**Exemplo de Requisição**:

```bash
# Por squad_id
curl https://api.synkra.ai/api/squads/devops-squad

# Por UUID
curl https://api.synkra.ai/api/squads/550e8400-e29b-41d4-a716-446655440000
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "squad_id": "devops-squad",
    "name": "devops-squad",
    "version": "2.1.0",
    "description": "Squad de automação DevOps para pipelines CI/CD",
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

**Resposta de Erro** (404):

```json
{
  "success": false,
  "error": "Squad not found"
}
```

---

### Atualizar Squad

Atualizar configurações de visibilidade do squad.

```
PATCH /api/squads/:id
```

**Autenticação**: Obrigatória (apenas proprietário)

**Parâmetros de Path**:

| Parâmetro | Tipo   | Descrição                 |
| --------- | ------ | ------------------------- |
| `id`      | string | UUID do squad ou squad_id |

**Corpo da Requisição**:

| Campo      | Tipo    | Descrição                    |
| ---------- | ------- | ---------------------------- |
| `isPublic` | boolean | Definir visibilidade pública |

**Exemplo de Requisição**:

```bash
curl -X PATCH https://api.synkra.ai/api/squads/my-squad \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"isPublic": true}'
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "squad_id": "my-squad",
    "name": "my-squad",
    "is_public": true,
    "updated_at": "2025-12-26T10:00:00Z"
  }
}
```

---

### Excluir Squad

Remover um squad do Synkra.

```
DELETE /api/squads/:id
```

**Autenticação**: Obrigatória (apenas proprietário)

**Parâmetros de Path**:

| Parâmetro | Tipo   | Descrição                 |
| --------- | ------ | ------------------------- |
| `id`      | string | UUID do squad ou squad_id |

**Exemplo de Requisição**:

```bash
curl -X DELETE https://api.synkra.ai/api/squads/my-old-squad \
  -H "Authorization: Bearer sk_your_api_key"
```

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "message": "Squad deleted successfully"
}
```

---

### Validar Squad

Validar dados do squad sem persistir.

```
POST /api/squads/validate
```

**Autenticação**: Opcional

**Corpo da Requisição**:

| Campo       | Tipo   | Obrigatório | Descrição                       |
| ----------- | ------ | ----------- | ------------------------------- |
| `squadData` | object | Sim         | Manifesto do squad para validar |

**Exemplo de Requisição**:

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

**Resposta de Sucesso** (200):

```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": ["Missing recommended field: description", "Missing aiox.minVersion field"]
  }
}
```

**Resposta de Falha na Validação** (200):

```json
{
  "success": false,
  "data": {
    "valid": false,
    "errors": ["name is required", "version must be valid semver"],
    "warnings": []
  }
}
```

---

## Códigos de Erro

| Código HTTP | Significado                                     |
| ----------- | ----------------------------------------------- |
| 200         | Sucesso                                         |
| 400         | Bad Request - Entrada inválida                  |
| 401         | Unauthorized - Autenticação ausente ou inválida |
| 403         | Forbidden - Permissões insuficientes            |
| 404         | Not Found - Squad não existe                    |
| 500         | Internal Server Error                           |

### Formato de Resposta de Erro

```json
{
  "success": false,
  "error": "Mensagem de erro legível"
}
```

---

## Limites de Taxa

| Plano      | Requisições/min | Requisições/dia |
| ---------- | --------------- | --------------- |
| Free       | 60              | 1.000           |
| Pro        | 300             | 10.000          |
| Enterprise | Ilimitado       | Ilimitado       |

Headers de limite de taxa:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1703577600
```

---

## Integração CLI

O comando `*sync-squad-synkra` usa esta API:

```bash
# Sincronizar um único squad
@squad-creator
*sync-squad-synkra ./squads/my-squad --public

# Sincronização em lote de todos os squads
*sync-squad-synkra ./squads/* --public
```

Configurar chave de API:

```bash
export SYNKRA_API_TOKEN="sk_your_api_key"
```

---

## Coleção Postman

Importe esta coleção no Postman ou Insomnia:

```json
{
  "info": {
    "name": "Synkra Squads API",
    "description": "API REST para o Marketplace de Squads Synkra",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "https://api.synkra.ai"
    },
    {
      "key": "apiKey",
      "value": "sk_your_api_key"
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
          "name": "Sync Squad",
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
              "raw": "{\n  \"squadData\": {\n    \"name\": \"my-squad\",\n    \"version\": \"1.0.0\",\n    \"description\": \"My squad\",\n    \"aiox\": {\n      \"minVersion\": \"2.1.0\",\n      \"type\": \"squad\"\n    }\n  },\n  \"isPublic\": false\n}"
            }
          }
        },
        {
          "name": "Batch Sync",
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
          "name": "List Public Squads",
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
          "name": "Get Squad Details",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/squads/devops-squad"
          }
        }
      ]
    },
    {
      "name": "Management",
      "item": [
        {
          "name": "List My Squads",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/squads/mine"
          }
        },
        {
          "name": "Update Squad Visibility",
          "request": {
            "method": "PATCH",
            "url": "{{baseUrl}}/api/squads/my-squad",
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
          "name": "Delete Squad",
          "request": {
            "method": "DELETE",
            "url": "{{baseUrl}}/api/squads/my-squad"
          }
        }
      ]
    },
    {
      "name": "Validation",
      "item": [
        {
          "name": "Validate Squad",
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

Salve o JSON acima como `synkra-squads-api.postman_collection.json` e importe no Postman.

---

## Recursos Relacionados

- [Guia de Desenvolvimento de Squads](../guides/squads-guide.md)
- [Contribuindo com Squads](../guides/contributing-squads.md)
- [Agente @squad-creator](../../../.aiox-core/development/agents/squad-creator.md)

---

**Versão:** 1.0.0 | **Atualizado:** 2025-12-26 | **Story:** SQS-8
