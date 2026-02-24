<!-- 翻译: ZH-CN | 原始: /docs/en/architecture/hcs-self-healing-spec.md | 同步: 2026-02-22 -->

# HCS 自动恢复规范

> 🌐 [EN](../../architecture/hcs-self-healing-spec.md) | [PT](../../pt/architecture/hcs-self-healing-spec.md) | **ZH**

---

**版本:** 1.0
**状态:** 提议
**创建:** 2025-12-30
**故事:** HCS-1 调查
**作者:** @architect (Aria) via @dev (Dex)

---

## 执行摘要

本文档指定了 AIOS 健康检查系统 (HCS) 的自动恢复能力。自动恢复允许系统自动纠正某些问题,同时保持安全性和用户控制。

### 基本原则

1. **安全第一:** 永远不修改可能导致数据丢失或安全问题的文件
2. **透明性:** 所有操作都被记录和可逆的
3. **用户控制:** 关键修复需要显式确认
4. **增量式:** 从安全修复开始,在复杂情况下向用户升级

---

## 自动恢复哲学

### 应用的行业模式

| 系统        | 自动恢复方法                       | HCS 教训                              |
| ----------- | ---------------------------------- | ------------------------------------- |
| **Kubernetes** | 在 liveness 失败时重启容器        | 已知安全操作的自动恢复              |
| **VS Code**    | 自动更新扩展,阻止恶意扩展        | 静默更新、显式阻止                  |
| **Terraform**  | 仅在 `plan` 批准后 `apply`        | 分离检测和补救                      |
| **npm/yarn**   | `--update-checksums` 修复完整性  | 用户启动的恢复命令                  |
| **Git**        | `reflog` 恢复                     | 始终保留历史/备份                    |

---

## 级别定义

### 级别 1: 静默自动纠正

**定义:** 安全且可逆的操作,不需要用户确认。

**特性:**

- 零数据丢失风险
- 完全可逆
- 无用户代码/配置更改
- 仅框架/系统文件
- 始终创建备份

**操作:**

| 操作                | 描述                                      | 备份 |
| ------------------- | ----------------------------------------- | ---- |
| `recreate_config`   | 从模板重新创建缺失的 `.aios/config.yaml` | 是   |
| `clear_cache`       | 清除 `.aios/cache/` 中的过期缓存文件     | 是   |
| `create_dirs`       | 创建缺失的框架目录                        | 否   |
| `fix_permissions`   | 修复框架文件权限                          | 是   |
| `regenerate_lockfile` | 再生成包锁文件完整性                     | 是   |
| `restart_mcp`       | 重启无响应的 MCP 服务器                   | 否   |
| `reset_project_status` | 重置损坏的项目状态文件                   | 是   |

---

### 级别 2: 带确认的自动纠正

**定义:** 中等风险操作,执行前需要用户确认。

**特性:**

- 可能修改与用户相邻的文件(非用户代码)
- 带备份可逆
- 可能暂时影响工作流
- 需要用户显式"是"

**操作:**

| 操作                 | 描述                         | 备份 | 用户提示                    |
| -------------------- | ---------------------------- | ---- | --------------------------- |
| `update_deps`        | 更新过期的依赖               | 是   | "更新 X 个包?"             |
| `fix_symlinks`       | 修复断裂的符号链接           | 是   | "修复 N 个断裂的链接?"     |
| `regenerate_files`   | 从模板再生文件               | 是   | "从模板再生?"               |
| `fix_ide_config`     | 修复 IDE 配置                | 是   | "修复 VS Code 设置?"       |
| `migrate_config`     | 迁移配置到新版本             | 是   | "迁移 config v1→v2?"       |
| `create_missing_docs` | 创建缺失的文档文件          | 否   | "创建 coding-standards.md?" |

---

### 级别 3: 手动指南

**定义:** 无法安全自动纠正的高风险或复杂问题。提供解决的指导。

**特性:**

- 数据丢失或损坏风险
- 涉及用户代码/配置
- 需要人的判断
- 安全敏感的操作
- 破坏兼容性的更改

---

## 安全规则

### 永不自动纠正(黑名单)

以下文件/操作**永不**自动纠正:

```yaml
neverAutoFix:
  files:
    - '**/*.{js,ts,jsx,tsx,py,go,rs}' # 源代码
    - '**/*.{json,yaml,yml}' # 用户配置(out of .aios/)
    - '.env*' # 环境文件
    - '**/secrets/**' # 密钥
    - '**/credentials*' # 凭证
    - '.git/**' # Git 内部
    - 'package.json' # 用户依赖
    - 'tsconfig.json' # 用户配置
    - '.eslintrc*' # 用户 linting 规则

  operations:
    - delete_user_files # 永不删除用户文件
    - modify_git_history # 永不重写 git 历史
    - change_remote_urls # 永不修改远程
    - push_to_remote # 永不自动推送
    - modify_ci_secrets # 永不触及 CI 密钥
    - change_permissions_recursive # 永不 chmod -R
```

---

## 相关文档

- [ADR: HCS 架构](./adr/adr-hcs-health-check-system.md)
- [HCS 执行模式](./hcs-execution-modes.md)
- [HCS 检查规范](./hcs-check-specifications.md)

---

_文档作为 Story HCS-1 调查的一部分创建_
