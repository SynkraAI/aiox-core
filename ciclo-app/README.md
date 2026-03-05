# Ciclo das Estacoes

PWA Full-Stack para gestao de eventos sazonais de autocuidado da Base Triade.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 3.4 + shadcn/ui
- **ORM:** Prisma 5
- **Database:** PostgreSQL 16 (Supabase)
- **Monorepo:** Turborepo + pnpm workspaces
- **Linguagem:** TypeScript (strict)

## Estrutura

```
ciclo-app/
├── apps/
│   ├── web/          # App principal (participantes/PWA) — porta 3000
│   ├── admin/        # Dashboard administrativo — porta 3001
│   └── landing/      # Landing page marketing (ISR) — porta 3002
├── packages/
│   ├── ui/           # Componentes compartilhados (shadcn/ui + Tailwind)
│   ├── database/     # Prisma schema + client
│   ├── config/       # ESLint, Tailwind, TSConfig compartilhados
│   ├── email/        # Templates React Email
│   └── utils/        # Funcoes helpers
└── turbo.json        # Pipeline configuration
```

## Setup Local

### Pre-requisitos

- Node.js >= 18.17
- pnpm >= 9.0 (`npm install -g pnpm`)

### Instalacao

```bash
# 1. Clone o repositorio
git clone <repo-url>
cd ciclo-app

# 2. Instale as dependencias
pnpm install

# 3. Configure as variaveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# 4. Gere o Prisma Client
pnpm --filter @ciclo/database db:generate

# 5. Inicie o desenvolvimento
pnpm dev
```

### Comandos

| Comando | Descricao |
|---------|-----------|
| `pnpm dev` | Inicia todas as apps em modo desenvolvimento |
| `pnpm build` | Build de producao (paralelo via Turborepo) |
| `pnpm lint` | Executa ESLint em todos os packages |
| `pnpm typecheck` | Verifica tipos TypeScript |
| `pnpm format` | Formata codigo com Prettier |

### Portas

| App | Porta | URL |
|-----|-------|-----|
| web | 3000 | http://localhost:3000 |
| admin | 3001 | http://localhost:3001 |
| landing | 3002 | http://localhost:3002 |

## Variaveis de Ambiente

Veja `.env.example` para a lista completa. Variaveis obrigatorias:

- `DATABASE_URL` — Connection string pooled do Supabase (runtime)
- `DIRECT_URL` — Connection string direct do Supabase (migrations)
- `NEXTAUTH_SECRET` — Secret para NextAuth.js (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — URL base da app (`http://localhost:3000`)

---

iAi . ECOssistema Base Triade(TM)
