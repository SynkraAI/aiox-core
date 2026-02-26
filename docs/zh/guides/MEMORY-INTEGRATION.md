# 记忆智能系统 - 集成指南

<!--
  本文件由翻译工具生成
  源文件: docs/guides/MEMORY-INTEGRATION.md
  翻译日期: 2026-02-22
-->

**Epic:** MIS (记忆智能系统)
**Story:** MIS-6 - 管道集成与代理记忆 API
**最后更新:** 2026-02-09

---

## 概述

本指南说明记忆智能系统如何与 UnifiedActivationPipeline 集成，以便为代理提供对机构知识的自动访问。

**关键概念:**
- **渐进式披露:** 记忆按层加载 (HOT → WARM → COLD)，基于 token 预算
- **代理范围:** 每个代理仅访问自己的 + 共享记忆 (强制隐私)
- **优雅降级:** 系统在所有级别都能工作 (无 pro, 无摘要, 有摘要)
- **Feature Gating:** 记忆功能通过 `pro.memory.extended` 和 `pro.memory.pipeline-integration` 控制

---

## 架构

### 扩展点模式

集成遵循 AIOS Open Core 模型:
- **aios-core:** UnifiedActivationPipeline 中的扩展点 (本指南)
- **aios-pro:** 记忆智能实现 (检索, 评分, 学习)

```
UnifiedActivationPipeline (Tier 2 Enrich)
  └─> isProAvailable()?
      ├─> 是: 从 pro/ 加载 MemoryLoader
      │   └─> isFeatureEnabled('pro.memory.extended')?
      │       ├─> 是: 将记忆加载到 enrichedContext.memories
      │       └─> 否: enrichedContext.memories = []
      └─> 否: enrichedContext.memories = []
```

### 数据流

1. **代理激活:**
   ```javascript
   @dev  // 用户激活 dev 代理
   ```

2. **管道 Tier 2 (Enrich):**
   ```javascript
   // UnifiedActivationPipeline 检查 pro 可用性
   if (isProAvailable()) {
     const MemoryLoader = loadProModule('memory/memory-loader');
     const loader = new MemoryLoader(projectRoot);

     // 为代理加载记忆，带预算
     const result = await loader.loadForAgent('dev', { budget: 2000 });
     enrichedContext.memories = result.memories;
   }
   ```

3. **渐进式披露:**
   ```javascript
   // 首先 HOT 层级 (高注意力记忆)
   hotMemories = retrieve({ tier: 'hot', layer: 1 }) // ~600 tokens

   // 如果预算允许，添加 WARM 层级
   if (tokensUsed < budget * 0.7) {
     warmMemories = retrieve({ tier: 'warm', layer: 2 }) // ~800 tokens
   }

   // 总计: 13 个记忆, 使用 1400 tokens
   ```

4. **上下文丰富:**
   ```javascript
   enrichedContext = {
     agent: agentDefinition,
     config: agentConfig,
     memories: [
       {
         id: 'mem-001',
         title: 'Story MIS-4 完成，121 个测试',
         summary: '渐进式记忆检索已实现...',
         sector: 'procedural',
         tier: 'hot',
         attention_score: 0.85,
         agent: 'dev'
       },
       // ... 另外 12 个记忆
     ],
     // ... 其他上下文字段
   }
   ```

---

## Memory Loader API

Memory Loader 提供 6 个记忆检索方法:

### 1. `loadForAgent(agentId, options)` - 主方法

为代理激活加载记忆 (由 UnifiedActivationPipeline 使用)。

```javascript
const { MemoryLoader } = require('pro/memory/memory-loader');
const loader = new MemoryLoader(projectRoot);

const result = await loader.loadForAgent('dev', {
  budget: 2000,      // Token 预算
  layers: [1, 2]     // 渐进式披露层
});

// 结果:
{
  memories: [
    { id, title, summary, sector, tier, attention_score, agent, ... }
  ],
  metadata: {
    agent: 'dev',
    count: 13,
    tokensUsed: 1400,
    budget: 2000,
    tiers: ['hot', 'warm']
  }
}
```

**渐进式披露逻辑:**
- 从 HOT 层级开始 (第 1 层 - 仅索引)
- 如果 `tokensUsed < budget * 0.7`，添加 WARM 层级 (第 2 层 - 上下文片段)
- 永远不超过配置的预算

### 2. `queryMemories(agentId, options)` - 灵活查询

带高级过滤的记忆查询。

```javascript
const memories = await loader.queryMemories('dev', {
  tokenBudget: 2000,
  attentionMin: 0.3,              // 默认 WARM+
  sectors: ['procedural', 'semantic'],  // 覆盖代理偏好
  tags: ['performance', 'testing'],
  tier: 'hot',                    // 按层级过滤
  layer: 1,                       // 强制特定层
  limit: 10                       // 最大返回记忆数
});
```

### 3. `getHotMemories(agentId, options)` - 快速访问

仅获取高注意力记忆 (分数 > 0.7)。

```javascript
const hotMemories = await loader.getHotMemories('dev', {
  limit: 5,
  tokenBudget: 1000
});
```

### 4. `getWarmMemories(agentId, options)` - 中等注意力

获取中等注意力记忆 (0.3 ≤ 分数 < 0.7)。

```javascript
const warmMemories = await loader.getWarmMemories('dev', {
  limit: 10,
  tokenBudget: 1500
});
```

### 5. `searchByTags(agentId, tags, options)` - 基于标签检索

按标签查找记忆。

```javascript
const memories = await loader.searchByTags('dev', ['mcp', 'docker'], {
  limit: 5
});
```

### 6. `getRecentMemories(agentId, days, options)` - 基于时间

获取最近 N 天的记忆。

```javascript
const recentMemories = await loader.getRecentMemories('dev', 7, {
  limit: 10
});
```

---

## 代理领域偏好

每个代理根据其角色有偏好的认知领域:

| 代理 | 领域 | 理由 |
|-------|---------|-----------|
| **dev** | 程序, 语义 | 如何 (模式, 陷阱) + 什么 (事实, API) |
| **qa** | 反思, 情景 | 学到 (错误) + 发生 (测试结果) |
| **architect** | 语义, 反思 | 什么 (架构) + 学到 (设计决策) |
| **pm** | 情景, 语义 | 发生 (决策) + 事实 (需求) |
| **po** | 情景, 语义 | 发生 (反馈) + 事实 (stories) |
| **sm** | 程序, 情景 | 如何 (流程) + 发生 (sprint 事件) |

**4 个认知领域:**
1. **情景:** 发生了什么 (事件, 结果, 里程碑)
2. **语义:** 什么是真的 (事实, 定义, 架构)
3. **程序:** 如何做事 (模式, 陷阱, 程序)
4. **反思:** 学到了什么 (洞察, 修正, 教训)

---

## Token 预算管理

### 默认预算

```javascript
// 默认: 每次代理激活 2000 tokens
const defaultBudget = 2000;
```

### 自定义预算 (代理配置)

在代理配置中配置每代理预算:

```yaml
# .aios-core/development/agents/dev.md
agent:
  id: dev
  config:
    memoryBudget: 3000  # dev 代理的自定义预算
```

### 渐进式披露策略

1. **HOT 层级 (第 1 层 - 仅索引):**
   - 高注意力记忆 (分数 > 0.7)
   - 典型使用: 600 tokens (8 个记忆 × 每个 75 tokens)

2. **WARM 层级 (第 2 层 - 上下文片段):**
   - 仅当 `tokensUsed < budget * 0.7` 时添加
   - 典型使用: 800 tokens (5 个记忆 × 每个 160 tokens)

3. **总计:**
   - 13 个记忆, 1400 tokens (2000 预算的 70%)
   - 为系统开销保留 600 tokens 缓冲

---

## 优雅降级

系统在 3 个级别工作:

### 级别 1: 无 Pro 可用

```javascript
isProAvailable() === false
```

**行为:**
- `enrichedContext.memories = []`
- 不抛出错误
- 管道正常继续
- 代理像 MIS 之前一样运行

### 级别 2: Pro 可用, 无摘要

```javascript
isProAvailable() === true
// 但 .aios/session-digests/ 为空
```

**行为:**
- `MemoryLoader` 返回 `{ memories: [], metadata: { count: 0 } }`
- 不抛出错误
- 管道正常继续

### 级别 3: Pro 可用, 有摘要

```javascript
isProAvailable() === true
// 且 .aios/session-digests/ 包含记忆摘要
```

**行为:**
- 完整记忆智能激活
- 记忆加载并注入 `enrichedContext`
- 代理自动接收机构知识

---

## Feature Gate 配置

### 必需的 Features

1. **pro.memory.extended:** 控制记忆注入
2. **pro.memory.pipeline-integration:** 追踪集成状态

### 检查 Feature 可用性

```javascript
const { featureGate } = require('pro/license/feature-gate');

if (featureGate.isAvailable('pro.memory.extended')) {
  // 记忆注入已启用
}

if (featureGate.isAvailable('pro.memory.pipeline-integration')) {
  // 管道集成激活
}
```

### 许可证层级

| 层级 | 包含的 Features |
|------|------------------|
| **Individual** | `pro.memory.extended` |
| **Team** | `pro.memory.*` (所有记忆功能) |
| **Enterprise** | `pro.*` (所有 pro 功能) |

---

## 性能要求

### 延迟目标

- **记忆加载 (Tier 2):** < 200ms 典型
- **超时保护:** 500ms 最大
- **总管道:** < 500ms (包含记忆加载)

### 性能监控

管道追踪记忆加载器指标:

```javascript
result.metrics.loaders.memories = {
  status: 'ok',          // 'ok' | 'timeout' | 'error'
  duration: 45,          // 毫秒
  startTime: 1234567890,
  endTime: 1234567935
}
```

---

## 代理隐私

### 范围规则

每个代理仅访问:
1. **自己的记忆:** `agent === agentId`
2. **共享记忆:** `agent === 'shared'`

**绝不:**
- 其他代理的私有记忆

### 示例

```javascript
// Dev 代理激活
const devResult = await pipeline.activate('dev');

// Dev 看到:
devResult.context.memories.map(m => m.agent)
// → ['dev', 'dev', 'shared', 'dev', 'shared', ...]

// QA 代理激活
const qaResult = await pipeline.activate('qa');

// QA 看到:
qaResult.context.memories.map(m => m.agent)
// → ['qa', 'shared', 'qa', 'qa', 'shared', ...]
```

**隐私强制:**
- 在检索层实现 (`memory-retriever.js`)
- 6 个专用隐私测试 (来自 MIS-4)
- 未检测到跨代理泄漏

---

## 故障排除

### 问题: 记忆未出现

**诊断:**
```javascript
// 检查 pro 可用性
const { isProAvailable } = require('bin/utils/pro-detector');
console.log('Pro 可用:', isProAvailable());

// 检查 feature gate
const { featureGate } = require('pro/license/feature-gate');
console.log('记忆启用:', featureGate.isAvailable('pro.memory.extended'));

// 检查摘要目录
const fs = require('fs');
const digests = fs.readdirSync('.aios/session-digests');
console.log('摘要:', digests.length);
```

**解决方案:**
1. **Pro 不可用:** 初始化 `pro/` 子模块: `git submodule update --init --recursive`
2. **Feature gate 禁用:** 检查许可证密钥: `cat pro/license-cache.json`
3. **无摘要:** 捕获第一个会话: `@dev` (激活任何代理, 然后压缩上下文)

### 问题: 记忆加载超时

**诊断:**
```javascript
result.metrics.loaders.memories.status === 'timeout'
result.metrics.loaders.memories.duration > 500
```

**解决方案:**
1. 减少摘要数量 (将旧摘要归档到 `.aios/session-digests/archive/`)
2. 增加超时 (在 `unified-activation-pipeline.js` 中): `memoryTimeout = 1000`
3. 重建记忆索引: `node pro/memory/rebuild-index.js`

### 问题: 代理的记忆不正确

**诊断:**
```javascript
// 验证代理领域偏好
const { AGENT_SECTOR_PREFERENCES } = require('pro/memory/memory-loader');
console.log('Dev 领域:', AGENT_SECTOR_PREFERENCES['dev']);
```

**解决方案:**
1. 更新 `pro/memory/memory-loader.js` 中的领域偏好
2. 在查询中覆盖领域: `loader.loadForAgent('dev', { sectors: ['custom'] })`
3. 重新训练注意力评分 (MIS-5 - 自学习引擎, 未来 story)

---

## 集成测试

### 测试覆盖

5 个集成测试场景:

1. **无 Pro 可用:** 没有 pro/ 的激活 → 空记忆, 无错误
2. **Pro 可用, 无摘要:** Pro 存在但无记忆数据 → 空数组
3. **Pro 可用, 有摘要:** 完整 MIS 激活 → 记忆已注入
4. **Token 预算强制:** 永不超过配置限制
5. **代理范围隐私:** 仅返回自己的 + 共享记忆

### 运行测试

```bash
# 运行所有集成测试
npm test -- tests/integration/pipeline-memory-integration.test.js

# 运行特定场景
npm test -- tests/integration/pipeline-memory-integration.test.js -t "No Pro Available"

# 带覆盖率
npm test -- tests/integration/pipeline-memory-integration.test.js --coverage
```

**目标覆盖率:** 集成代码 >= 85%

---

## 相关文档

- **[记忆系统 (当前状态)](MEMORY-SYSTEM.md)** - 记忆架构概述
- **[记忆智能系统 (目标状态)](MEMORY-INTELLIGENCE-SYSTEM.md)** - 完整 MIS 愿景
- **Story MIS-3:** 会话摘要 (PreCompact Hook) - 记忆捕获
- **Story MIS-4:** 渐进式记忆检索 - 检索 API
- **Story MIS-6:** 管道集成 - 本指南

---

## 未来增强

**MIS-5: 自学习引擎** (待定)
- 自动注意力评分调优
- 从用户修正中识别模式
- 从结果中提取启发式

**MIS-7: CLAUDE.md 自动演化** (待定)
- 基于学习成果的规则更新
- 代理配置自动优化
- 陷阱自动文档化

---

*记忆智能系统 - 集成指南*
*最后更新: 2026-02-09*
*Epic MIS - Story MIS-6*
