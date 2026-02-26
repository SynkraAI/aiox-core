# AIOS Pro — Guia de Instalacao e Licenciamento

Guia completo para instalar, ativar e gerenciar o AIOS Pro.

**Story:** PRO-6 — License Key & Feature Gating System

---

## Visao Geral

O AIOS Pro e distribuido via npm publico. O pacote e livre para instalar, mas as features premium requerem uma **licenca ativa** para funcionar.

```
Comprar Licenca → Instalar → Ativar → Usar Features Pro
```

### Pacotes npm

| Pacote | Tipo | Proposito |
|--------|------|-----------|
| `aios-pro` | CLI (1.8 KB) | Comandos de instalacao e gerenciamento |
| `@aios-fullstack/pro` | Core (10 MB) | Features premium (squads, memory, metrics, integrations) |

---

## Instalacao Rapida

```bash
# Instalar AIOS Pro (instala @aios-fullstack/pro automaticamente)
npx aios-pro install

# Ativar sua licenca
npx aios-pro activate --key PRO-XXXX-XXXX-XXXX-XXXX

# Verificar ativacao
npx aios-pro status
```

---

## Passo a Passo

### Prerequisitos

- Node.js >= 18
- `aios-core` >= 4.0.0 instalado no projeto

### Passo 1: Instalar AIOS Pro

```bash
npx aios-pro install
```

Isso executa `npm install @aios-fullstack/pro` no seu projeto.

**Alternativa** (instalacao manual):

```bash
npm install @aios-fullstack/pro
```

### Passo 2: Ativar Licenca

Apos a compra, voce recebera uma chave no formato `PRO-XXXX-XXXX-XXXX-XXXX`.

```bash
npx aios-pro activate --key PRO-XXXX-XXXX-XXXX-XXXX
```

Esse comando:
1. Valida a chave contra o License Server (`https://aios-license-server.vercel.app`)
2. Registra sua maquina (machine ID unico)
3. Salva um cache local criptografado para uso offline

### Passo 3: Verificar

```bash
# Status da licenca
npx aios-pro status

# Listar features disponiveis
npx aios-pro features
```

---

## Comandos Disponiveis

| Comando | Descricao |
|---------|-----------|
| `npx aios-pro install` | Instala `@aios-fullstack/pro` no projeto |
| `npx aios-pro activate --key KEY` | Ativa uma chave de licenca |
| `npx aios-pro status` | Mostra status da licenca atual |
| `npx aios-pro features` | Lista todas as features pro e disponibilidade |
| `npx aios-pro validate` | Forca revalidacao online da licenca |
| `npx aios-pro deactivate` | Desativa a licenca nesta maquina |
| `npx aios-pro help` | Mostra todos os comandos |

---

## Operacao Offline

Apos a instalacao e ativacao, o AIOS Pro funciona offline:

- **30 dias** sem necessidade de revalidacao
- **7 dias de grace period** apos expirar o cache
- Verificacao de features 100% local no dia a dia

A internet so e necessaria para:
1. Ativacao inicial (`npx aios-pro activate`)
2. Revalidacao periodica (automatica a cada 30 dias)
3. Desativacao (`npx aios-pro deactivate`)

---

## CI/CD

Para pipelines, instale e ative usando secrets de ambiente:

**GitHub Actions:**
```yaml
- name: Install AIOS Pro
  run: npx aios-pro install

- name: Activate License
  run: npx aios-pro activate --key ${{ secrets.AIOS_PRO_LICENSE_KEY }}
```

**GitLab CI:**
```yaml
before_script:
  - npx aios-pro install
  - npx aios-pro activate --key ${AIOS_PRO_LICENSE_KEY}
```

---

## Troubleshooting

### Chave de licenca invalida

```
License activation failed: Invalid key format
```

- Verifique o formato: `PRO-XXXX-XXXX-XXXX-XXXX` (4 blocos de 4 caracteres hex)
- Sem espacos extras
- Abra uma issue em https://github.com/SynkraAI/aios-core/issues se a chave foi fornecida a voce

### Maximo de seats excedido

```
License activation failed: Maximum seats exceeded
```

- Desative a licenca na outra maquina: `npx aios-pro deactivate`
- Ou contate support para aumentar o limite de seats

### Erro de rede na ativacao

```
License activation failed: ECONNREFUSED
```

- Verifique sua conexao com a internet
- O License Server pode estar temporariamente indisponivel
- Tente novamente em alguns minutos

---

## Arquitetura do Sistema

```
┌─────────────────┐     ┌─────────────────────────────────┐     ┌──────────┐
│  Cliente (CLI)   │────>│  License Server (Vercel)        │────>│ Supabase │
│  npx aios-pro    │<────│  aios-license-server.vercel.app │<────│ Database │
└─────────────────┘     └─────────────────────────────────┘     └──────────┘
                                                                      │
                                                                      │
                        ┌─────────────────────────────────┐           │
                        │  Admin Dashboard (Vercel)       │───────────┘
                        │  aios-license-dashboard         │
                        │  Cria/revoga/gerencia licencas  │
                        └─────────────────────────────────┘
```

| Componente | URL | Proposito |
|-----------|-----|-----------|
| License Server | `https://aios-license-server.vercel.app` | API de ativacao/validacao |
| Admin Dashboard | `https://aios-license-dashboard.vercel.app` | Gestao de licencas (admin) |
| Database | Supabase PostgreSQL | Armazena licencas e ativacoes |

---

## Suporte

- **Documentacao:** https://synkra.ai/pro/docs
- **Comprar:** https://synkra.ai/pro
- **Suporte:** https://github.com/SynkraAI/aios-core/issues
- **Issues:** https://github.com/SynkraAI/aios-core/issues

---

*AIOS Pro Installation Guide v3.0*
*Story PRO-6 — License Key & Feature Gating System*
