# IDE同步指南

> **[EN](../../guides/ide-sync-guide.md)** | [PT](../../pt/guides/ide-sync-guide.md) | [ES](../../es/guides/ide-sync-guide.md) | **中文 (ZH)**

---

在多个IDE配置中同步AIOS代理、任务、工作流和检查清单。

## 概述

`*command` 任务自动化AIOS组件到所有配置的IDE目录（`.claude/`、`.cursor/`、`.gemini/` 等）的同步，省去手动复制操作。

## 快速开始

### 1. 设置配置

将模板复制到项目根目录:

```bash
cp .aios-core/infrastructure/templates/aios-sync.yaml.template .aios-sync.yaml
```

### 2. 配置IDE

编辑 `.aios-sync.yaml` 启用您的IDE:

```yaml
active_ides:
  - claude # Claude Code (.claude/commands/)
  - cursor # Cursor IDE (.cursor/rules/)
  # - gemini    # Google Gemini (.gemini/)
```

### 3. 添加小队别名

将您的小队目录映射到命令前缀:

```yaml
squad_aliases:
  legal: Legal # squads/legal/ → .claude/commands/Legal/
  copy: Copy # squads/copy/ → .claude/commands/Copy/
  hr: HR # squads/hr/ → .claude/commands/HR/
```

## 使用

### 同步单个组件

```bash
# 同步特定代理
*command agent legal-chief

# 同步特定任务
*command task revisar-contrato

# 同步特定工作流
*command workflow contract-review
```

### 同步整个小队

```bash
# 同步小队的所有组件
*command squad legal
```

### 同步所有小队

```bash
# 同步所有内容
*command sync-all
```

## 工作原理

```
squads/legal/agents/legal-chief.md
         │
         ▼
┌─────────────────────────────────────────────────────┐
│                 *command sync                        │
│                                                      │
│  1. 读取 .aios-sync.yaml 配置                        │
│  2. 检查组件是否存在于 squads/                       │
│  3. 应用包装转换（如果需要）                        │
│  4. 复制到每个活跃IDE的目标                          │
│  5. 验证同步的文件                                   │
│  6. 记录操作                                         │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  .claude/commands/Legal/agents/legal-chief.md        │
│  .cursor/rules/legal-chief.mdc                       │
│  .gemini/agents/legal-chief.md                       │
└──────────────────────────────────────────────────────┘
```

## 同步映射

组件类型的默认映射:

| 组件类型 | Claude | Cursor | Gemini | Ollama |
| -------------- | ------ | ------ | ------ | -------- |
| 代理         | ✅     | ✅     | ✅     | ✅       |
| 任务          | ✅     | -      | -      | -        |
| 工作流      | ✅     | ✅     | -      | -        |
| 检查清单     | ✅     | -      | -      | -        |
| 数据           | ✅     | -      | -      | -        |

## 包装器

不同的IDE需要不同的格式:

### Claude (Markdown)

无需转换 - 文件按原样复制。

### Cursor (MDC)

文件被包装上前置元数据:

```yaml
---
description: { 从代理提取 }
globs: []
alwaysApply: false
---
{ 原始内容 }
```

## 目录结构

```
your-project/
├── .aios-sync.yaml           # 同步配置
├── squads/                   # 真实来源
│   └── legal/
│       ├── config.yaml
│       ├── agents/
│       ├── tasks/
│       └── checklists/
├── .claude/
│   └── commands/
│       └── Legal/           # 自动同步
│           ├── agents/
│           ├── tasks/
│           └── checklists/
├── .cursor/
│   └── rules/               # 自动同步（MDC格式）
└── .gemini/
    └── agents/              # 自动同步
```

## 最佳实践

1. **永远不要直接编辑 `.claude/commands/`** - 始终在 `squads/` 中编辑并同步
2. **使用描述性名称** - 代理名称变成斜杠命令
3. **保持 config.yaml 更新** - 需要正确同步
4. **在更改后运行同步** - 确保所有IDE保持同步

## 故障排除

### 组件未找到

```
错误: 在 squads/ 中未找到组件 'my-agent'
```

**解决方案**: 验证代理存在于 `squads/*/agents/my-agent.md`

### 缺失小队别名

```
警告: 对于 'new-squad' 没有小队别名
```

**解决方案**: 将别名添加到 `.aios-sync.yaml`:

```yaml
squad_aliases:
  new-squad: NewSquad
```

### IDE未同步

检查IDE是否在 `active_ides` 部分中启用。

## 相关

- [小队概览](./squads-overview.md)
- [代理参考指南](../agent-reference-guide.md)
- [AIOS架构](../core-architecture.md)
