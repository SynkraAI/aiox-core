# Stamp Report — create-t3-app

> Source: https://github.com/t3-oss/create-t3-app
> Analyzed: 2026-04-08T15:40:00Z

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (scaffolded) | — |
| Package Manager | pnpm | 10.8.0 |
| Monorepo | Turborepo | 1.13.3 |
| Bundler (CLI) | tsup | ^6.7.0 |
| Language | TypeScript (strict + noUncheckedIndexedAccess) | ^5.8.2 |
| Linting | ESLint 9 (flat config) | ^9.23.0 |
| Formatting | Prettier | ^3.5.3 |
| CLI Prompts | @clack/prompts | — |
| CLI Parsing | commander | — |
| Versioning | Changesets | ^2.27.3 |
| Docs | Astro + React + MDX + Tailwind | — |
| Deploy (docs) | Vercel | — |

## Folder Structure

```
create-t3-app/
├── cli/                     # PACOTE PRINCIPAL: CLI scaffolder
│   ├── src/
│   │   ├── cli/             # Interface: parsing de argumentos + prompts
│   │   ├── helpers/         # Orquestração: createProject, scaffold, git, format
│   │   ├── installers/      # Plugin system: um arquivo por tecnologia
│   │   └── utils/           # Funções puras: logger, validators, parsers
│   ├── template/
│   │   ├── base/            # Scaffold mínimo (copiado integralmente)
│   │   └── extras/          # Fragmentos condicionais por feature
│   ├── tsup.config.ts       # Build config
│   └── package.json
├── www/                     # Site de documentação (Astro)
├── turbo.json               # Pipeline orchestration
├── pnpm-workspace.yaml      # Workspace: cli, www
└── tsconfig.json            # Config base compartilhada
```

**Arquitetura:** Monorepo flat com 2 pacotes (cli + www). Sem shared packages. Turborepo orquestra builds.

## Design Patterns

### Installer Plugin System (padrão principal)
- **Where:** `cli/src/installers/index.ts`
- **How:** Cada tecnologia é um "installer" que segue a interface `Installer`. O `PkgInstallerMap` mapeia cada pacote para `{ inUse: boolean, installer: Installer }`. Iteração programática: se `inUse`, executa o installer.
- **Adopt?** Yes — extremamente extensível. Adicionar pacote = criar installer + registrar no map.

### Template Composition via File Copy
- **Where:** `cli/template/base/` + `cli/template/extras/`
- **How:** Base é copiado integralmente. Extras são condicionais, nomeados `with-{feature}.tsx`.
- **Adopt?** Yes com modificação — funciona para escopo pequeno, mas não escala com muitas combinações.

### Dependency Version Map
- **Where:** `cli/src/installers/dependencyVersionMap.ts`
- **How:** `Record<string, string>` centralizado. Evita fetch do npm em runtime.
- **Adopt?** Yes — garante consistência e performance.

### Sequential Pipeline
- **Where:** `cli/src/index.ts`
- **How:** `renderTitle → runCli → buildMap → createProject → setAlias → install → format → git → logNext`
- **Adopt?** Yes para CLIs simples. Considerar hooks para pipelines complexos.

### Dual Mode (Interactive/CI)
- **Where:** `cli/src/cli/index.ts`
- **How:** Flag `--CI` com feature flags booleanas (`--tailwind --trpc`). Validação de combinações incompatíveis.
- **Adopt?** Yes — essencial para automação.

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files (source) | camelCase | `createProject.ts`, `scaffoldProject.ts` |
| Directories | kebab-case | `start-database/`, `db-container/` |
| Templates | kebab-case + `with-` prefix | `with-auth-trpc-tw.tsx` |
| Functions | camelCase | `buildPkgInstallerMap()`, `addPackageDependency()` |
| Types/Interfaces | PascalCase | `InstallerOptions`, `PkgInstallerMap` |
| Constants | UPPER_SNAKE ou camelCase | `PKG_ROOT`, `DEFAULT_APP_NAME` |
| Import alias | `~/` | `import { PKG_ROOT } from "~/consts.js"` |

## Code Organization

**Layer-based dentro de feature-based:**
- `cli/` = interface layer (prompts, parsing)
- `helpers/` = orchestration layer (workflows de alto nível)
- `installers/` = plugin layer (um por tecnologia)
- `utils/` = shared utilities (funções puras)

Dentro de `installers/`, cada arquivo = um pacote instalável (feature-based).

## Configuration

- **Env:** Sem .env no CLI. Projetos scaffolded usam `@t3-oss/env-nextjs` com schema validation
- **Build:** tsup para CLI (ESM, single entry, minificado em prod)
- **CI:** Changesets para release management. `--CI` flag para modo não-interativo
- **TypeScript:** strict + noUncheckedIndexedAccess + @total-typescript/ts-reset

## Recommended Adoption

### Adotar
- **Installer Plugin Pattern** — Extensível, cada tech é independente
- **Dependency Version Map** — Consistência sem registry lookup
- **Template base + extras** — Simples e funcional
- **@clack/prompts** — UX superior para CLIs interativos
- **Dual mode Interactive/CI** — Obrigatório para automação
- **Import alias `~/`** — Consistente com AIOX (`@/` equivalente)

### Adaptar
- **Template composition** — Usar composição com slots em vez de N^2 arquivos pré-escritos
- **Sequential pipeline** — Adicionar hooks (pre/post) e rollback para pipelines complexos

### Pular
- **Cascade if/else em selectBoilerplate** — Não escala. Usar array de transformações
- **Monorepo flat sem shared** — Se houver código compartilhado entre pacotes, criar `packages/shared/`
- **Turbo 1.x canary** — Usar Turbo 2.x estável ou Nx se iniciar do zero
