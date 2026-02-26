<!-- 翻译: zh-CN | 原文: /docs/api/squads-api.md | 同步: 2026-02-22 -->

# Squads API 参考

REST API用于将squads同步到Synkra并发现marketplace中的squads。

## 概述

Squads API允许：

- **同步**: 将本地squads发送到Synkra云端
- **Marketplace**: 发现和浏览公共squads
- **管理**: 更新可见性、删除squads

**基础URL**: `https://api.synkra.ai`

## 认证

所有认证端点需要：

### API密钥（CLI推荐）

```http
Authorization: Bearer sk_your_api_key
```

### JWT令牌（Web应用）

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

获取您的API密钥：https://synkra.ai/settings/api-keys

## 端点

### 同步Squad

将squad定义发送到Synkra。

```http
POST /api/squads/sync
```

**认证**: 必需

**请求体**:

| 字段                    | 类型    | 必需 | 描述                                  |
| ----------------------- | ------- | ---- | ------------------------------------- |
| `squadData`             | object  | 是   | Squad清单数据                         |
| `squadData.name`        | string  | 是   | Squad名称                             |
| `squadData.version`     | string  | 是   | 语义版本                              |
| `squadData.description` | string  | 否   | Squad描述                             |
| `squadData.author`      | string  | 否   | 作者名称                              |
| `squadData.components`  | object  | 否   | Squad组件                             |
| `isPublic`              | boolean | 否   | 设为公开可见（默认：false）           |
| `isOfficial`            | boolean | 否   | 标记为官方（仅管理员）                |

**请求示例**:

```bash
curl -X POST https://api.synkra.ai/api/squads/sync \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "squadData": {
      "name": "my-squad",
      "version": "1.0.0",
      "description": "我的优秀squad",
      "aios": {
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

**成功响应** (200):

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

**错误响应** (400):

```json
{
  "success": false,
  "error": "Validation failed: name is required"
}
```

---

### 批量同步

在一个请求中同步多个squads。

```http
POST /api/squads/sync/batch
```

**认证**: 必需

**请求体**:

| 字段       | 类型    | 必需 | 描述                                  |
| ---------- | ------- | ---- | ------------------------------------- |
| `squads`   | array   | 是   | Squad数据对象数组                     |
| `isPublic` | boolean | 否   | 将所有squads设为公开（默认：false）   |

**请求示例**:

```bash
curl -X POST https://api.synkra.ai/api/squads/sync/batch \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "squads": [
      {
        "name": "squad-one",
        "version": "1.0.0",
        "description": "第一个squad"
      },
      {
        "name": "squad-two",
        "version": "2.0.0",
        "description": "第二个squad"
      }
    ],
    "isPublic": false
  }'
```

**成功响应** (200):

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

**部分失败响应** (200):

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

### 列出公共Squads（Marketplace）

浏览marketplace中可用的squads。

```http
GET /api/squads
```

**认证**: 可选

**查询参数**:

| 参数       | 类型    | 默认 | 描述                            |
| ---------- | ------- | ---- | ------------------------------- |
| `page`     | number  | 1    | 页码                            |
| `limit`    | number  | 20   | 每页项目数（最大：100）         |
| `tags`     | string  | -    | 逗号分隔的标签过滤              |
| `author`   | string  | -    | 按作者过滤                      |
| `search`   | string  | -    | 在名称/描述中搜索               |
| `official` | boolean | -    | 仅过滤官方squads                |

**请求示例**:

```bash
# 列出所有公共squads
curl https://api.synkra.ai/api/squads

# 带过滤器搜索
curl "https://api.synkra.ai/api/squads?tags=devops,automation&search=deploy&official=true&limit=10"
```

**成功响应** (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "squad_id": "devops-squad",
      "name": "devops-squad",
      "version": "2.1.0",
      "description": "DevOps自动化squad",
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

### 列出我的Squads

列出属于您工作区的squads。

```http
GET /api/squads/mine
```

**认证**: 必需

**查询参数**:

| 参数    | 类型   | 默认 | 描述            |
| ------- | ------ | ---- | --------------- |
| `page`  | number | 1    | 页码            |
| `limit` | number | 20   | 每页项目数      |

**请求示例**:

```bash
curl https://api.synkra.ai/api/squads/mine \
  -H "Authorization: Bearer sk_your_api_key"
```

**成功响应** (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "squad_id": "my-private-squad",
      "name": "my-private-squad",
      "version": "1.0.0",
      "description": "我的内部squad",
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

### 获取Squad详情

获取特定squad的详细信息。

```http
GET /api/squads/:id
```

**认证**: 可选（私有squads必需）

**路径参数**:

| 参数 | 类型   | 描述                  |
| ---- | ------ | --------------------- |
| `id` | string | Squad的UUID或squad_id |

**请求示例**:

```bash
# 通过squad_id
curl https://api.synkra.ai/api/squads/devops-squad

# 通过UUID
curl https://api.synkra.ai/api/squads/550e8400-e29b-41d4-a716-446655440000
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "squad_id": "devops-squad",
    "name": "devops-squad",
    "version": "2.1.0",
    "description": "用于CI/CD管道的DevOps自动化squad",
    "author": "SynkraAI",
    "license": "MIT",
    "slash_prefix": "devops",
    "tags": ["devops", "automation", "ci-cd"],
    "is_public": true,
    "is_official": true,
    "manifest": {
      "name": "devops-squad",
      "version": "2.1.0",
      "aios": {
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

**错误响应** (404):

```json
{
  "success": false,
  "error": "Squad not found"
}
```

---

### 更新Squad

更新squad的可见性设置。

```http
PATCH /api/squads/:id
```

**认证**: 必需（仅所有者）

**路径参数**:

| 参数 | 类型   | 描述                  |
| ---- | ------ | --------------------- |
| `id` | string | Squad的UUID或squad_id |

**请求体**:

| 字段       | 类型    | 描述             |
| ---------- | ------- | ---------------- |
| `isPublic` | boolean | 设置公开可见性   |

**请求示例**:

```bash
curl -X PATCH https://api.synkra.ai/api/squads/my-squad \
  -H "Authorization: Bearer sk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"isPublic": true}'
```

**成功响应** (200):

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

### 删除Squad

从Synkra删除squad。

```http
DELETE /api/squads/:id
```

**认证**: 必需（仅所有者）

**路径参数**:

| 参数 | 类型   | 描述                  |
| ---- | ------ | --------------------- |
| `id` | string | Squad的UUID或squad_id |

**请求示例**:

```bash
curl -X DELETE https://api.synkra.ai/api/squads/my-old-squad \
  -H "Authorization: Bearer sk_your_api_key"
```

**成功响应** (200):

```json
{
  "success": true,
  "message": "Squad deleted successfully"
}
```

---

### 验证Squad

验证squad数据而不持久化。

```http
POST /api/squads/validate
```

**认证**: 可选

**请求体**:

| 字段        | 类型   | 必需 | 描述                    |
| ----------- | ------ | ---- | ----------------------- |
| `squadData` | object | 是   | 要验证的squad清单       |

**请求示例**:

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

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": ["Missing recommended field: description", "Missing aios.minVersion field"]
  }
}
```

**验证失败响应** (200):

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

## 错误代码

| HTTP代码 | 含义                                  |
| -------- | ------------------------------------- |
| 200      | 成功                                  |
| 400      | Bad Request - 无效输入                |
| 401      | Unauthorized - 认证缺失或无效         |
| 403      | Forbidden - 权限不足                  |
| 404      | Not Found - Squad不存在               |
| 500      | Internal Server Error                 |

### 错误响应格式

```json
{
  "success": false,
  "error": "人类可读的错误消息"
}
```

---

## 速率限制

| 计划       | 请求/分钟 | 请求/天     |
| ---------- | --------- | ----------- |
| Free       | 60        | 1,000       |
| Pro        | 300       | 10,000      |
| Enterprise | 无限制    | 无限制      |

速率限制头：

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1703577600
```

---

## CLI集成

`*sync-squad-synkra`命令使用此API：

```bash
# 同步单个squad
@squad-creator
*sync-squad-synkra ./squads/my-squad --public

# 批量同步所有squads
*sync-squad-synkra ./squads/* --public
```

配置API密钥：

```bash
export SYNKRA_API_TOKEN="sk_your_api_key"
```

---

## Postman集合

在Postman或Insomnia中导入此集合：

```json
{
  "info": {
    "name": "Synkra Squads API",
    "description": "Synkra Squads Marketplace的REST API",
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
              "raw": "{\n  \"squadData\": {\n    \"name\": \"my-squad\",\n    \"version\": \"1.0.0\",\n    \"description\": \"My squad\",\n    \"aios\": {\n      \"minVersion\": \"2.1.0\",\n      \"type\": \"squad\"\n    }\n  },\n  \"isPublic\": false\n}"
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

将上述JSON保存为 `synkra-squads-api.postman_collection.json` 并导入Postman。

---

## 相关资源

- [Squads开发指南](../guides/squads-guide.md)
- [贡献Squads](../guides/contributing-squads.md)
- [@squad-creator代理](../../../.aios-core/development/agents/squad-creator.md)

---

**版本:** 1.0.0 | **更新:** 2025-12-26 | **Story:** SQS-8
