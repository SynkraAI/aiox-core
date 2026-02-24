<!-- 翻译: zh-CN | 原文: /docs/architecture/adr/adr-isolated-vm-decision.md | 同步日期: 2026-02-22 -->

# ADR: isolated-vm 与 macOS 兼容性

**状态:** 已取代
**日期:** 2026-01-04
**更新:** 2026-01-27
**Story:** TD-6 - CI 稳定性和测试覆盖率改进
**作者:** @devops (Gage)
**取代者:** 移除依赖 (v3.11.0)

## 更新 (2026-01-27)

**决策已更改:** `isolated-vm` 已从依赖中**完全移除**。

### 移除原因

经过代码分析，我们发现 `isolated-vm` 实际上从未在代码库中使用。它是作为未来沙箱代码执行的占位符添加的，但从未实现。

### 移除的好处

1. **完全兼容 Node.js 18-24** 在所有平台（macOS、Linux、Windows）
2. **依赖树减少 43 个包**
3. **减少 6 个漏洞**（8 → 2）
4. **不再有原生模块编译问题**
5. **100% CI 矩阵覆盖**（12 种组合：3 个操作系统 × 4 个 Node 版本）

### 更新的依赖

| 包 | 之前 | 之后 | 最低 Node.js |
| --- | --- | --- | --- |
| `isolated-vm` | ^5.0.4 | **已移除** | N/A |
| `commander` | ^14.0.1 | ^12.1.0 | >=18 |
| `glob` | ^11.0.3 | ^10.4.4 | 14, 16, 18, 20, 22+ |

---

## 原始背景（历史记录）

在 CI 测试期间，我们观察到使用 `isolated-vm` 时 macOS 上 Node.js 18.x 和 20.x 出现 SIGSEGV 崩溃。这影响了 CI 矩阵覆盖。

## 原始调查发现

### 受影响的配置

| 平台 | Node 版本 | 状态 |
| --- | --- | --- |
| macOS ARM64 | 18.x | SIGSEGV 崩溃 |
| macOS ARM64 | 20.x | SIGSEGV 崩溃 |
| macOS ARM64 | 22.x | 正常 |
| macOS x64 | 所有 | 正常 |
| Ubuntu | 所有 | 正常 |
| Windows | 所有 | 正常 |

### 根本原因

**GitHub Issue:** [laverdet/isolated-vm#424](https://github.com/laverdet/isolated-vm/issues/424) - "Segmentation fault on Node 20 macos arm64"

问题是 `isolated-vm` 的原生绑定与 macOS 上 18.x 和 20.x 版本的 Node.js ARM64 构建之间存在已知的不兼容性。

## 原始决策（现已取代）

**保持当前 CI 矩阵排除** macOS + Node 18/20。

此决策已被完全移除项目依赖中的 `isolated-vm` 所取代。

## 参考

- [isolated-vm#424 - Segmentation fault on Node 20 macos arm64](https://github.com/laverdet/isolated-vm/issues/424)
- [isolated-vm releases](https://github.com/laverdet/isolated-vm/releases)
