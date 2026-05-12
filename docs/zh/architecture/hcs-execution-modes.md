<!-- 翻译: ZH-CN | 原始: /docs/en/architecture/hcs-execution-modes.md | 同步: 2026-02-22 -->

# HCS 执行模式规范

> 🌐 [EN](../../architecture/hcs-execution-modes.md) | [PT](../../pt/architecture/hcs-execution-modes.md) | **ZH**

---

**版本:** 1.0
**状态:** 提议
**创建:** 2025-12-30
**故事:** HCS-1 调查
**作者:** @architect (Aria) via @dev (Dex)

---

## 执行摘要

本文档定义了 AIOX 健康检查系统 (HCS) 的执行模式,基于 Kubernetes、VS Code、Terraform、npm/yarn 和 CLI "doctor" 模式(Flutter、Homebrew、WP-CLI)的行业最佳实践研究。

### 主要建议

1. **主模式:** 按需手动(`*health-check` 命令)
2. **次模式:** 计划 CI 集成(merge 后触发)
3. **可选模式:** IDE 中的后台检查(仅高级用户)
4. **不推荐:** 预提交钩子(太慢,造成摩擦)

---

## 执行模式比较矩阵

| 模式                     | 触发方式       | 持续时间 | UX 影响                    | 用例           | 建议                |
| ------------------------ | -------------- | -------- | -------------------------- | -------------- | ------------------- |
| **手动** (`*health-check`) | 用户命令       | 10-60s   | 无(用户启动)              | 按需诊断      | ✅ **主模式**       |
| **预提交钩子**           | `git commit`   | 10-30s   | 高摩擦                     | 早期捕获问题   | ❌ 不推荐          |
| **后提交钩子**           | 提交后         | 10-60s   | 中等摩擦                   | 本地验证       | ⚠️ 可选            |
| **CI 计划**              | Cron/工作流    | 60-300s  | 无                         | 持续监控       | ✅ **次模式**      |
| **merge 后触发**         | PR 合并        | 60-120s  | 无                         | 合并后验证     | ✅ **第三模式**    |
| **IDE 后台**             | 保存/间隔      | 5-15s    | 细微指示器                 | 实时反馈       | ⚠️ 仅高级用户     |
| **安装/启动时**          | `npx aiox install` | 60-120s | 预期的                 | 设置验证       | ✅ **强制**        |

---

## 推荐配置

### 默认配置

```yaml
healthCheck:
  enabled: true

  modes:
    manual:
      enabled: true
      command: '*health-check'
      defaultMode: 'quick'
      autoFix: true

    scheduled:
      enabled: true
      frequency: 'daily'
      ciProvider: 'github-actions'
      mode: 'full'
      reportArtifact: true

    postMerge:
      enabled: true
      branches: ['main', 'develop']
      mode: 'quick'

    ideBackground:
      enabled: false
      interval: 300
      mode: 'quick'

    postCommit:
      enabled: false
      mode: 'quick'

    onInstall:
      enabled: true
      mode: 'full'
      failOnCritical: true

  performance:
    quickModeTimeout: 10
    fullModeTimeout: 60
    parallelChecks: true
    cacheResults: true
    cacheTTL: 300
```

---

## 相关文档

- [ADR: HCS 架构](./adr/adr-hcs-health-check-system.md)
- [HCS 自动恢复规范](./hcs-self-healing-spec.md)
- [HCS 检查规范](./hcs-check-specifications.md)

---

## 研究来源

- [Kubernetes 健康探针](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)
- [Terraform 漂移检测](https://developer.hashicorp.com/terraform/tutorials/state/resource-drift)
- [npm 锁文件完整性](https://medium.com/node-js-cybersecurity/lockfile-poisoning-and-how-hashes-verify-integrity-in-node-js-lockfiles)
- [VS Code 扩展健康](https://code.visualstudio.com/blogs/2021/02/16/extension-bisect)
- [Flutter Doctor 模式](https://quickcoder.org/flutter-doctor/)
- [WP-CLI Doctor 命令](https://github.com/wp-cli/doctor-command)

---

_文档作为 Story HCS-1 调查的一部分创建_
