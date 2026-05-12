<!--
  翻译：zh-CN（简体中文）
  原文：/docs/README.md
  最后同步：2026-02-23
-->

# Synkra AIOX 中文文档

> 🌐 [EN](../README.md) | [PT](../pt/README.md) | [ES](../es/README.md) | **ZH**

> **面向全栈开发的 AI 编排系统**

---

## 🌐 选择语言 / Select Language / Selecione o Idioma / Seleccione el Idioma

| 语言            | 状态         | 链接                                                    |
| --------------- | ------------ | ------------------------------------------------------- |
| **English**     | ✅ 完整      | [📖 English Documentation](../getting-started.md)       |
| **Português**   | ✅ 完整      | [📖 Documentação em Português](../pt/getting-started.md) |
| **Español**     | ✅ 完整      | [📖 Documentación en Español](../es/getting-started.md) |
| **中文（简体）** | 🟡 进行中    | [📖 中文文档](./getting-started.md)                     |

---

## 📚 文档结构

```text
docs/
├── getting-started.md         # English (root)
├── guides/                    # English
├── installation/              # English
├── architecture/              # English
├── framework/                 # English
├── platforms/                 # English
├── aiox-agent-flows/          # Detailed agent documentation (PT)
├── aiox-workflows/            # Detailed workflow documentation (PT)
│
├── pt/                        # Português
├── es/                        # Español
└── zh/                        # 中文（简体）
```

---

## 🚀 快速入口

### English

- [Getting Started](../getting-started.md)
- [Installation Guide](../installation/README.md)
- [Architecture Overview](../core-architecture.md)
- [Meta-Agent Commands](../meta-agent-commands.md)
- [Agent System Documentation](../en/aiox-agent-flows/README.md)
- [Workflow Documentation](../en/aiox-workflows/README.md)
- [Troubleshooting](../troubleshooting.md)

### Português

- [Começando](../pt/getting-started.md)
- [Guia de Instalação](../pt/installation/README.md)
- [Visão Geral da Arquitetura](../pt/architecture/ARCHITECTURE-INDEX.md)
- [Referência de Agentes](../pt/agent-reference-guide.md)
- [Documentação do Sistema de Agentes](../aiox-agent-flows/README.md)
- [Documentação de Workflows](../aiox-workflows/README.md)
- [Solução de Problemas](../pt/troubleshooting.md)

### Español

- [Comenzando](../es/getting-started.md)
- [Guía de Instalación](../es/installation/README.md)
- [Visión General de la Arquitectura](../es/architecture/ARCHITECTURE-INDEX.md)
- [Referencia de Agentes](../es/agent-reference-guide.md)
- [Documentación del Sistema de Agentes](../es/aiox-agent-flows/README.md)
- [Documentación de Workflows](../es/aiox-workflows/README.md)
- [Solución de Problemas](../es/troubleshooting.md)

### 中文（简体）

- [快速入门](./getting-started.md)
- [安装指南](./installation/README.md)
- [架构总览](./architecture/ARCHITECTURE-INDEX.md)
- [代理参考](./agent-reference-guide.md)
- [代理系统文档](./aiox-agent-flows/README.md)
- [工作流文档](./aiox-workflows/README.md)
- [故障排查](./troubleshooting.md)

---

## 📊 中文文档完整度审查（2026-02-23）

| 对比语言 | 对比总文件数 | 中文同名覆盖 | 覆盖率 |
| -------- | ------------ | ------------ | ------ |
| PT       | 122          | 104          | 85.2%  |
| ES       | 147          | 127          | 86.4%  |

### 当前主要缺口

- `platforms/README.md`
- `platforms/antigravity.md`
- `platforms/claude-code.md`
- `platforms/cursor.md`
- `platforms/gemini-cli.md`
- `platforms/github-copilot.md`
- `guides/user-guide.md`
- `guides/squads-overview.md`
- `guides/testing-guide.md`
- `ide-integration.md`
- `installation/v4-quick-start.md`
- `npx-install.md`
- `roadmap.md`

---

## 🤝 参与翻译

我们欢迎社区参与中文文档翻译和改进：

1. Fork 仓库
2. 选择待翻译文档
3. 按照 [TRANSLATION-PLAN](./TRANSLATION-PLAN.md) 执行
4. 提交 Pull Request

翻译建议：

- 术语请优先参考 [GLOSSARY](./GLOSSARY.md)
- 代码块保持原样，不翻译
- 文件头保留原文路径与同步日期
- 优先补齐“当前主要缺口”中的文件

---

_Synkra AIOX 中文文档_
