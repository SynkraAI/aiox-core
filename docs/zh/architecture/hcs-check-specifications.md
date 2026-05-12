<!-- 翻译: ZH-CN | 原始: /docs/en/architecture/hcs-check-specifications.md | 同步: 2026-02-22 -->

# HCS 检查规范

> 🌐 [EN](../../architecture/hcs-check-specifications.md) | [PT](../../pt/architecture/hcs-check-specifications.md) | **ZH**

---

**版本:** 1.0
**状态:** 提议
**创建:** 2025-12-30
**故事:** HCS-1 调查
**作者:** @architect (Aria) via @dev (Dex)

---

## 目录

- [概览](#概览)
- [检查架构](#检查架构)
- [域 1: 项目一致性](#域-1-项目一致性)
- [域 2: 本地环境](#域-2-本地环境)
- [域 3: 存储库健康](#域-3-存储库健康)
- [域 4: 部署环境](#域-4-部署环境)
- [域 5: 服务集成](#域-5-服务集成)
- [IDE/CLI 检查矩阵](#idecli-检查矩阵)
- [自定义检查扩展](#自定义检查扩展)
- [性能考虑](#性能考虑)

---

## 概览

健康检查系统 (HCS) 在 5 个域中执行诊断检查,总共超过 33 个单独检查。每个检查包含:

- **唯一 ID:** 用于跟踪和报告
- **严重性:** CRITICAL、HIGH、MEDIUM、LOW、INFO
- **自动恢复级别:** 1(静默)、2(需确认)、3(手动指南)、N/A
- **模式:** quick(仅快速检查)、full(所有检查)
- **目标持续时间:** 预期执行时间

### 检查计数摘要

| 域                  | 总检查数 | 快速模式 | 完整模式 |
| ------------------- | -------- | -------- | -------- |
| 项目一致性          | 8        | 4        | 8        |
| 本地环境            | 8        | 5        | 8        |
| 存储库健康          | 8        | 3        | 8        |
| 部署环境            | 5        | 2        | 5        |
| 服务集成            | 4        | 4        | 4        |
| **总计**            | **33**   | **18**   | **33**   |

---

## 检查架构

### 架构决策: 混合模式

基于行业研究,HCS 使用**混合架构**结合:

1. **基于代码的检查** 用于核心功能(性能、复杂逻辑)
2. **基于 YAML 的检查** 用于可扩展性(自定义检查、项目特定)

### 检查接口

```javascript
// 核心检查接口 (JavaScript)
class BaseCheck {
  constructor(options) {
    this.id = options.id; // 例如: "PC-001"
    this.name = options.name; // 人类可读名称
    this.domain = options.domain; // project | local | repo | deploy | services
    this.severity = options.severity; // CRITICAL | HIGH | MEDIUM | LOW | INFO
    this.tier = options.tier; // 1 | 2 | 3 | null
    this.mode = options.mode; // quick | full
    this.timeout = options.timeout || 5000; // ms
  }

  // 在子类中覆盖
  async check(context) {
    // 返回 { passed: boolean, message: string, details?: any }
    throw new Error('未实现');
  }

  // 可选: 恢复逻辑
  async heal(context) {
    return { healed: false, message: '无自动修复可用' };
  }
}
```

---

## 文档相关

- [ADR: HCS 架构](./adr/adr-hcs-health-check-system.md)
- [HCS 执行模式](./hcs-execution-modes.md)
- [HCS 自动恢复规范](./hcs-self-healing-spec.md)

---

_文档作为 Story HCS-1 调查的一部分创建_
