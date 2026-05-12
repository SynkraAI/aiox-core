<!--
  Tradução: PT-BR
  Original: /docs/guides/permission-modes.md
  Última sincronização: 2026-01-29
-->

# Guia de Modos de Permissão

> Controle o nível de autonomia que os agentes AIOX têm sobre seu sistema.

---

## Visão Geral

Os Modos de Permissão permitem controlar o nível de autonomia dos agentes AIOX. Seja explorando um novo codebase ou executando builds totalmente autônomos, há um modo para seu workflow.

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 EXPLORAR        │  ⚠️ PERGUNTAR       │  ⚡ AUTO           │
│  Navegação segura   │  Confirmar mudanças │  Autonomia total  │
├─────────────────────────────────────────────────────────────┤
│  Ler: ✅            │  Ler: ✅             │  Ler: ✅          │
│  Escrever: ❌       │  Escrever: ⚠️ confirmar │  Escrever: ✅  │
│  Executar: ❌       │  Executar: ⚠️ confirmar │  Executar: ✅  │
│  Deletar: ❌        │  Deletar: ⚠️ confirmar  │  Deletar: ✅   │
└─────────────────────────────────────────────────────────────┘
```

---

## Início Rápido

```bash
# Verificar modo atual
*mode

# Mudar para modo explorar (seguro)
*mode explore

# Mudar para modo perguntar (balanceado - padrão)
*mode ask

# Mudar para modo auto (yolo)
*mode auto
# ou
*yolo
```

---

## Modos Explicados

### 🔍 Modo Explorar

**Melhor para:** Primeira exploração, aprender um codebase, auditorias somente leitura

```
*mode explore
```

No modo Explorar:

- ✅ Ler qualquer arquivo
- ✅ Pesquisar no codebase
- ✅ Executar comandos somente leitura (git status, ls, etc.)
- ❌ Não pode escrever ou editar arquivos
- ❌ Não pode executar comandos potencialmente destrutivos
- ❌ Não pode executar operações de build/deploy

**Exemplos de operações bloqueadas:**

- Ferramentas `Write` / `Edit`
- `git push`, `git commit`
- `npm install`
- `rm`, `mv`, `mkdir`

---

### ⚠️ Modo Perguntar (Padrão)

**Melhor para:** Desenvolvimento diário, equilíbrio entre segurança e produtividade

```
*mode ask
```

No modo Perguntar:

- ✅ Ler qualquer arquivo
- ⚠️ Operações de escrita requerem confirmação
- ⚠️ Operações de execução requerem confirmação
- ⚠️ Operações destrutivas requerem aprovação explícita

**Fluxo de confirmação:**

```
⚠️ Confirmação Necessária

Operação: write
Ferramenta: Edit

Arquivo: `src/components/Button.tsx`

[Prosseguir] [Pular] [Mudar para Auto]
```

---

### ⚡ Modo Auto

**Melhor para:** Usuários avançados, builds autônomos, workflows confiáveis

```
*mode auto
# ou
*yolo
```

No modo Auto:

- ✅ Acesso total de leitura
- ✅ Acesso total de escrita
- ✅ Acesso total de execução
- ✅ Sem confirmações necessárias

**Aviso:** Use com cautela. O agente pode modificar e deletar arquivos sem perguntar.

---

## Indicador de Modo

Seu modo atual está sempre visível na saudação do agente:

```
🏛️ Aria (Architect) pronta! [⚠️ Perguntar]

Comandos Rápidos:
...
```

O badge mostra:

- `[🔍 Explorar]` - Modo somente leitura
- `[⚠️ Perguntar]` - Modo com confirmação (padrão)
- `[⚡ Auto]` - Modo autonomia total

---

## Configuração

O modo é persistido em `.aiox/config.yaml`:

```yaml
permissions:
  mode: ask # explore | ask | auto
```

---

## Classificação de Operações

O sistema classifica operações em 4 tipos:

| Tipo        | Exemplos                                        |
| ----------- | ----------------------------------------------- |
| **read**    | `Read`, `Glob`, `Grep`, `git status`, `ls`      |
| **write**   | `Write`, `Edit`, `mkdir`, `touch`, `git commit` |
| **execute** | `npm install`, `npm run`, execução de tasks     |
| **delete**  | `rm`, `git reset --hard`, `DROP TABLE`          |

### Comandos Seguros (Sempre Permitidos)

Estes comandos são sempre permitidos, mesmo no modo Explorar:

```bash
# Git (somente leitura)
git status, git log, git diff, git branch

# Sistema de arquivos (somente leitura)
ls, pwd, cat, head, tail, wc, find, grep

# Informações de pacotes
npm list, npm outdated, npm audit

# Informações do sistema
node --version, npm --version, uname, whoami
```

### Comandos Destrutivos (Cautela Extra)

Estes disparam classificação delete e requerem aprovação explícita mesmo no modo Perguntar:

```bash
rm -rf
git reset --hard
git push --force
DROP TABLE
DELETE FROM
TRUNCATE
```

---

## Integração com ADE

O Autonomous Development Engine (ADE) respeita os modos de permissão:

| Modo          | Comportamento do ADE              |
| ------------- | --------------------------------- |
| **Explorar**  | Apenas planejamento, sem execução |
| **Perguntar** | Agrupa operações para aprovação   |
| **Auto**      | Execução totalmente autônoma      |

### Aprovação em Lote no Modo Perguntar

Ao executar workflows autônomos, operações são agrupadas:

```
⚠️ Confirmação em Lote

As seguintes 5 operações serão executadas:
- write: Criar src/components/NewFeature.tsx
- write: Atualizar src/index.ts
- execute: npm install lodash
- write: Adicionar tests/newFeature.test.ts
- execute: npm test

[Aprovar Todas] [Revisar Cada] [Cancelar]
```

---

## Melhores Práticas

### Para Novos Usuários

1. Comece com `*mode explore` para navegar com segurança
2. Mude para `*mode ask` quando estiver pronto para fazer alterações
3. Use `*mode auto` apenas quando estiver confiante

### Para CI/CD

Defina o modo na automação:

```yaml
# .github/workflows/aiox.yml
- name: Executar AIOX
  run: |
    echo "permissions:\n  mode: auto" > .aiox/config.yaml
    aiox run build
```

### Para Equipes

- Use `ask` como padrão em ambientes compartilhados
- Use `explore` para code reviews
- Reserve `auto` para contas de automação designadas

---

## Solução de Problemas

### "Operação bloqueada no modo Explorar"

Mude para um modo menos restritivo:

```
*mode ask
```

### Modo não persiste

Verifique se `.aiox/config.yaml` existe e é gravável:

```bash
ls -la .aiox/config.yaml
```

### Confirmações muito frequentes

Mude para modo Auto:

```
*mode auto
```

Ou use aprovação em lote nos workflows do ADE.

---

## Referência da API

```javascript
const { PermissionMode, OperationGuard } = require('./.aiox-core/core/permissions');

// Carregar modo atual
const mode = new PermissionMode();
await mode.load();
console.log(mode.currentMode); // 'ask'
console.log(mode.getBadge()); // '[⚠️ Perguntar]'

// Mudar modo
await mode.setMode('auto');

// Verificar operação
const guard = new OperationGuard(mode);
const result = await guard.guard('Bash', { command: 'rm -rf node_modules' });
// { proceed: false, needsConfirmation: true, operation: 'delete', ... }
```

---

_Modos de Permissão - Inspirado por [Craft Agents OSS](https://github.com/lukilabs/craft-agents-oss)_
