# Guia de Instalacao

## Pre-requisitos

- **Node.js** >= 18.0.0
- **Git** (qualquer versão)
- **AIOS Core** inicializado (`.aios-core/` existe no seu projeto)

---

## Incluido com AIOS Core

Navigator vem com AIOS Core. Depois de instalar AIOS, Navigator já está disponível:

```bash
# Instalar AIOS Core (Navigator já vem junto)
npx aios-core install

# Ativar Navigator
@navigator

# Verificar que tudo funciona
*navigator-doctor
```

Se o health check passar (7/7), você está pronto. Pule para [Verificar Instalação](#verificar-instalacao).

---

## Setup Manual

Se health check reportar problemas, corrija manualmente:

### 1. Instalar Dependencias

```bash
npm install js-yaml glob inquirer
```

### 2. Instalar Git Hooks

```bash
node squads/navigator/scripts/install-hooks.js
```

Isso adiciona um post-commit hook em `.husky/post-commit` que atualiza automaticamente seu roadmap quando stories mudam. O hook é:
- **Non-blocking** — roda assincronamente
- **Silent** — falhas não interrompem commits

### 3. Verificar

```bash
@navigator
*navigator-doctor
```

---

## Git Hooks

Navigator usa um post-commit hook pra manter roadmaps sincronizados automaticamente.

### Gerenciar Hooks

```bash
# Instalar
node squads/navigator/scripts/install-hooks.js

# Checar status
node squads/navigator/scripts/install-hooks.js --status

# Desinstalar
node squads/navigator/scripts/install-hooks.js --uninstall
```

### O Que o Hook Faz

A cada commit, o hook checa se algum arquivo em `docs/stories/` foi alterado. Se sim:
1. Detecta a fase atual
2. Sincroniza o roadmap (central + local)
3. Cria um auto-checkpoint se houve transição de fase

---

## Verificar Instalacao

```bash
@navigator
*navigator-doctor
```

**Output esperado:**

```
🧭 Navigator Health Check

✓ Node.js v20.x.x (>= 18.0.0)
✓ git version 2.x.x
✓ Todos os packages necessários instalados (js-yaml, glob, inquirer)
✓ Navigator post-commit hook instalado
✓ Todos os diretórios necessários existem
✓ Pipeline map válido (10 phases)
✓ Todos os 6 scripts presentes e legíveis

7/7 checks passaram

✅ Navigator está saudável!
```

---

## Estrutura de Diretorios

Depois da instalação, arquivos do Navigator ficam em:

```
squads/navigator/
├── squad.yaml              # Manifest
├── agents/
│   └── navigator.md        # Persona Vega
├── tasks/                  # 10 definições de task
├── scripts/
│   ├── navigator/          # Engine core (6 scripts)
│   └── install-hooks.js    # Instalador de hook
├── templates/              # 4 templates estilo Mustache
├── data/
│   └── navigator-pipeline-map.yaml
└── examples/               # Tutoriais práticos
```

Dados de runtime são guardados em:

```
.aios/navigator/{project-name}/
├── roadmap.md              # Roadmap central (source of truth)
└── checkpoints/            # Snapshots de estado do projeto
```

---

## Desinstalacao

```bash
# 1. Remover git hooks
node squads/navigator/scripts/install-hooks.js --uninstall

# 2. Remover dados de runtime (opcional)
rm -rf .aios/navigator/

# 3. Remover arquivos do squad (opcional)
rm -rf squads/navigator/
```

---

## Troubleshooting

| Problema | Solução |
|-------|-----|
| Dependências faltando | `npm install js-yaml glob inquirer` |
| Git hook não disparando | `npm run prepare && node squads/navigator/scripts/install-hooks.js` |
| Permission denied em scripts | `chmod +x squads/navigator/scripts/**/*.js` |
| Pipeline map inválido | Checar sintaxe YAML em `data/navigator-pipeline-map.yaml` |

Para mais, veja [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

---

## Suporte

- **Health Check:** `*navigator-doctor`
- **Issues:** [github.com/SynkraAI/aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
- **Docs:** [README.md](./README.md) · [QUICKSTART.md](./QUICKSTART.md)
