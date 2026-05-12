<!--
  Tradução: PT-BR
  Original: /docs/installation/README.md
  Última sincronização: 2026-02-01
-->

# Documentação de Instalação do Synkra AIOX

> 🌐 [EN](../../installation/README.md) | **PT** | [ES](../../es/installation/README.md)

---

**Versão:** 2.1.1
**Última Atualização:** 2026-02-01

---

## Visão Geral

Este diretório contém documentação abrangente de instalação e configuração para o Synkra AIOX.

---

## Índice de Documentação

### Guias por Plataforma

| Plataforma     | Guia                                       | Status      |
| -------------- | ------------------------------------------ | ----------- |
| 🍎 **macOS**   | [Guia de Instalação macOS](./macos.md)     | ✅ Completo |
| 🐧 **Linux**   | [Guia de Instalação Linux](./linux.md)     | ✅ Completo |
| 🪟 **Windows** | [Guia de Instalação Windows](./windows.md) | ✅ Completo |

### Documentação Geral

| Documento                                    | Descrição                               | Público-alvo      |
| -------------------------------------------- | --------------------------------------- | ----------------- |
| [Quick Start (v4)](./v4-quick-start.md)  | Configuração rápida para novos usuários | Iniciantes        |
| [Solução de Problemas](./troubleshooting.md) | Problemas comuns e soluções             | Todos os usuários |
| [FAQ](./faq.md)                              | Perguntas frequentes                    | Todos os usuários |

---

## Links Rápidos

### Nova Instalação

```bash
npx aiox-core install
```

### Atualização

```bash
npx aiox-core install --force-upgrade
```

### Está com Problemas?

1. Consulte o [Guia de Solução de Problemas](./troubleshooting.md)
2. Pesquise no [FAQ](./faq.md)
3. Abra uma [Issue no GitHub](https://github.com/SynkraAI/aiox-core/issues)

---

## Pré-requisitos

- Node.js 18.0.0+
- npm 9.0.0+
- Git 2.30+

---

## Plataformas Suportadas

| Plataforma    | Status           |
| ------------- | ---------------- |
| Windows 10/11 | Suporte Completo |
| macOS 12+     | Suporte Completo |
| Ubuntu 20.04+ | Suporte Completo |
| Debian 11+    | Suporte Completo |

---

## IDEs Suportadas

| IDE            | Ativação de Agentes |
| -------------- | ------------------- |
| Claude Code    | `/dev`, `/qa`, etc. |
| Cursor         | `@dev`, `@qa`, etc. |
| Gemini CLI     | Menção no prompt    |
| GitHub Copilot | Modos de chat       |

---

## Documentação Relacionada

- [Padrões de Código](../framework/coding-standards.md)
- [Stack Tecnológico](../framework/tech-stack.md)
- [Arquitetura](../architecture/)
- [Changelog](../CHANGELOG.md)

---

## Suporte

- **Issues no GitHub**: [aiox-core/issues](https://github.com/SynkraAI/aiox-core/issues)
- **Documentação**: [docs/](../)
