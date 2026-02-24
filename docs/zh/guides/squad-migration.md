# Squad迁移指南

> **EN** | **ZH-CN** | [PT](../pt/guides/squad-migration.md) | [ES](../es/guides/squad-migration.md)

---

如何将旧版Squad迁移到AIOS 2.1格式。

## 概述

AIOS 2.1引入了新的Squad格式，具有以下特性：
- 任务优先的架构
- JSON Schema验证
- 三层级分发
- 标准化清单 (`squad.yaml`)

使用 `config.yaml` 或旧格式的旧版Squad需要迁移。

## 检测旧版Squad

### 旧格式的迹象

| 指示器 | 旧版 | 当前 (2.1+) |
|--------|------|-------------|
| 清单文件 | `config.yaml` | `squad.yaml` |
| AIOS类型字段 | 缺失 | `aios.type: squad` |
| 最低版本 | 缺失 | `aios.minVersion: "2.1.0"` |
| 结构 | Agent优先 | Task优先 |

### 检查命令

```bash
@squad-creator
*validate-squad ./squads/legacy-squad
```

输出将指示是否需要迁移：

```
⚠️ 检测到旧版格式 (config.yaml)
   运行: *migrate-squad ./squads/legacy-squad
```

## 迁移命令

### 预览更改（推荐首先做）

```bash
@squad-creator
*migrate-squad ./squads/legacy-squad --dry-run
```

显示将进行的更改，不修改文件。

### 执行迁移

```bash
*migrate-squad ./squads/legacy-squad
```

### 详细输出

```bash
*migrate-squad ./squads/legacy-squad --verbose
```

显示详细的逐步进度。

## 迁移内容

### 1. 清单重命名

```
config.yaml → squad.yaml
```

### 2. 添加字段

```yaml
# 如果缺失，将添加这些字段
aios:
  minVersion: "2.1.0"
  type: squad
```

### 3. 结构规范化

组件被重新组织成标准结构：

```
迁移前：
├── config.yaml
├── my-agent.yaml
└── my-task.yaml

迁移后：
├── squad.yaml
├── agents/
│   └── my-agent.md
└── tasks/
    └── my-task.md
```

### 4. 文件格式转换

Agent YAML文件被转换为Markdown格式：

```yaml
# 迁移前: my-agent.yaml
name: my-agent
role: Helper
```

```markdown
# 迁移后: agents/my-agent.md
# my-agent

ACTIVATION-NOTICE: ...

\`\`\`yaml
agent:
  name: my-agent
  ...
\`\`\`
```

## 迁移场景

### 场景1：简单Squad（仅config.yaml）

**迁移前：**
```
my-squad/
├── config.yaml
└── README.md
```

**命令：**
```bash
*migrate-squad ./squads/my-squad
```

**迁移后：**
```
my-squad/
├── squad.yaml         # 已重命名 + 更新
├── README.md
└── .backup/           # 已创建备份
    └── pre-migration-2025-12-26/
```

### 场景2：带YAML Agent的Squad

**迁移前：**
```
my-squad/
├── config.yaml
├── agent.yaml
└── task.yaml
```

**命令：**
```bash
*migrate-squad ./squads/my-squad
```

**迁移后：**
```
my-squad/
├── squad.yaml
├── agents/
│   └── agent.md       # 转换为MD
├── tasks/
│   └── task.md        # 转换为MD
└── .backup/
```

### 场景3：部分迁移（已有部分2.1特性）

**迁移前：**
```
my-squad/
├── squad.yaml         # 已重命名
├── agent.yaml         # 仍为YAML格式
└── tasks/
    └── task.md        # 已为MD格式
```

**命令：**
```bash
*migrate-squad ./squads/my-squad
```

**结果：**
- 将缺失的 `aios` 字段添加到清单
- 转换保留的YAML文件
- 跳过已迁移的文件

## 备份与回滚

### 自动备份

每次迁移都会创建一个备份：

```
.backup/
└── pre-migration-{timestamp}/
    ├── config.yaml    # 原始清单
    ├── agent.yaml     # 原始文件
    └── ...
```

### 手动回滚

```bash
# 列出备份
ls ./squads/my-squad/.backup/

# 恢复特定备份
cp -r ./squads/my-squad/.backup/pre-migration-2025-12-26/. ./squads/my-squad/
```

### 编程式回滚

```javascript
const { SquadMigrator } = require('./.aios-core/development/scripts/squad');

const migrator = new SquadMigrator();
await migrator.rollback('./squads/my-squad');
```

## 故障排除

### "清单未找到"

```
错误: 未找到清单 (config.yaml 或 squad.yaml)
```

**解决方案：** 创建基本清单：

```yaml
# squad.yaml
name: my-squad
version: 1.0.0
description: 我的Squad

aios:
  minVersion: "2.1.0"
  type: squad

components:
  agents: []
  tasks: []
```

### "无效的YAML语法"

```
错误: 第15行处的YAML解析错误
```

**解决方案：**
1. 使用linter检查YAML语法
2. 常见问题：制表符（使用空格）、缺少引号
3. 修复错误，然后重试迁移

### "备份失败"

```
错误: 无法创建备份目录
```

**解决方案：**
1. 检查写权限: `chmod 755 ./squads/my-squad`
2. 检查磁盘空间
3. 尝试使用sudo（如果适当）

### "迁移不完整"

```
警告: 某些文件无法迁移
```

**解决方案：**
1. 使用 `--verbose` 查看哪些文件失败
2. 手动修复有问题的文件
3. 重新运行迁移

## 迁移后检查清单

迁移后，验证：

- [ ] `squad.yaml` 存在且有效
- [ ] `aios.type` 是 `"squad"`
- [ ] `aios.minVersion` 是 `"2.1.0"` 或更高
- [ ] 所有agent位于 `agents/` 文件夹中
- [ ] 所有task位于 `tasks/` 文件夹中
- [ ] Agent文件采用Markdown格式
- [ ] Task文件遵循TASK-FORMAT-SPEC-V1
- [ ] 验证通过: `*validate-squad --strict`

## 编程式迁移

```javascript
const { SquadMigrator } = require('./.aios-core/development/scripts/squad');

const migrator = new SquadMigrator({
  verbose: true,
  dryRun: false,
  backupDir: '.backup'
});

// 检查是否需要迁移
const needsMigration = await migrator.needsMigration('./squads/my-squad');

// 运行迁移
const result = await migrator.migrate('./squads/my-squad');

console.log(result);
// {
//   success: true,
//   changes: ['config.yaml → squad.yaml', ...],
//   backupPath: '.backup/pre-migration-...'
// }
```

## 相关资源

- [Squad开发指南](./squads-guide.md)
- [Squad贡献指南](./contributing-squads.md)
- [@squad-creator Agent](../../.aios-core/development/agents/squad-creator.md)

---

**版本:** 1.0.0 | **更新:** 2025-12-26 | **Story:** SQS-8
