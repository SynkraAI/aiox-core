<!--
  翻译：zh-CN（简体中文）
  原文：/docs/installation/README.md
  最后同步：2026-02-22
-->

# Synkra AIOX 安装文档

> 🌐 [EN](../../installation/README.md) | [PT](../pt/installation/README.md) | [ES](../es/installation/README.md) | **ZH**

**版本：** 2.1.0
**最后更新：** 2025-01-24

---

## 概述

本目录包含 Synkra AIOX 的完整安装和设置文档。

---

## 文档索引

### 平台特定指南

| 平台           | 指南                                       | 状态        |
| -------------- | ------------------------------------------ | ----------- |
| 🍎 **macOS**   | [macOS 安装指南](./macos.md)               | ✅ 完整     |
| 🐧 **Linux**   | [Linux 安装指南](./linux.md)               | ✅ 完整     |
| 🪟 **Windows** | [Windows 安装指南](./windows.md)           | ✅ 完整     |

### 通用文档

| 文档                                        | 描述                   | 受众       |
| ------------------------------------------- | ---------------------- | ---------- |
| [快速入门 (v4)](./v4-quick-start.md)        | 新用户快速设置         | 初学者     |
| [故障排除](./troubleshooting.md)            | 常见问题及解决方案     | 所有用户   |
| [常见问题](./faq.md)                        | 常见问题解答           | 所有用户   |

---

## 快速链接

### 新安装

```bash
npx @synkra/aiox-core install
```

### 升级

```bash
npx @synkra/aiox-core install --force-upgrade
```

### 遇到问题？

1. 查看[故障排除指南](./troubleshooting.md)
2. 搜索[常见问题](./faq.md)
3. 提交 [GitHub Issue](https://github.com/SynkraAI/aiox-core/issues)

---

## 前置要求

- Node.js 18.0.0+
- npm 9.0.0+
- Git 2.30+

---

## 支持的平台

| 平台          | 状态         |
| ------------- | ------------ |
| Windows 10/11 | 完整支持     |
| macOS 12+     | 完整支持     |
| Ubuntu 20.04+ | 完整支持     |
| Debian 11+    | 完整支持     |

---

## 支持的 IDE

| IDE            | Agent 激活方式      |
| -------------- | ------------------- |
| Claude Code    | `/dev`, `/qa` 等    |
| Cursor         | `@dev`, `@qa` 等    |
| Gemini CLI     | 在提示中提及        |
| GitHub Copilot | 聊天模式            |

---

## 相关文档

- [编码标准](../framework/coding-standards.md)
- [技术栈](../framework/tech-stack.md)
- [架构](../architecture/)
- [更新日志](../CHANGELOG.md)

---

## 支持

- **GitHub Issues**: [@synkra/aiox-core/issues](https://github.com/SynkraAI/aiox-core/issues)
- **文档**: [docs/](../)
