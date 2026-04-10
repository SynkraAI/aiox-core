# Gerenciamento de Portas — OBRIGATÓRIO para Dev Servers

## Regra (TODOS OS AGENTES, TODOS OS PROJETOS)

Antes de iniciar QUALQUER dev server (`npm run dev`, `next dev`, `vite`, `npm start`, etc.), você DEVE alocar uma porta usando o Port Manager.

**NUNCA fixe a porta 3000** (ou qualquer outra) ao iniciar um dev server. O usuário frequentemente tem múltiplos apps rodando simultaneamente e conflitos de porta causam crashes.

## Como Usar

### Passo 1: Alocar porta
```bash
eval $(node ~/aios-core/tools/port-manager.js auto <project-name>)
```

### Passo 2: Iniciar com a porta alocada
```bash
PORT=$PORT npm run dev
```

### One-liner
```bash
eval $(node ~/aios-core/tools/port-manager.js auto <project-name>) && PORT=$PORT npm run dev
```

### Verificar portas ocupadas
```bash
node ~/aios-core/tools/port-manager.js scan
```

## Faixas de Portas

| Tipo | Faixa | Exemplos |
|------|-------|----------|
| app | 3000-3099 | Next.js, Vite, apps React |
| api | 4000-4099 | Express, Fastify, NestJS |
| pipeline | 5000-5099 | Build tools, pipelines |
| squad | 8000-8099 | Dashboards de squads |

## O Que Isto Significa na Prática

- Ao criar um novo app: use o port-manager para alocar e salve a porta em `.env` ou `package.json`
- Ao rodar `npm run dev`: sempre prefixe com `eval $(node ~/aios-core/tools/port-manager.js auto <nome>) &&`
- Ao informar uma URL ao usuário: use a porta alocada, NÃO assuma 3000
- Ao escrever scripts em `package.json`: use `$PORT` ou a porta alocada, nunca valores fixos

## Anti-padrões

- `npm run dev` sem alocação de PORT
- `# Abra http://localhost:3000` sem verificar
- Fixar `PORT=3000` em arquivos `.env`
- Assumir que qualquer porta específica está livre
