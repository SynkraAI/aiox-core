# AIOX Pro — Guia de Instalacao e Licenciamento

Guia completo para instalar, ativar e gerenciar o AIOX Pro.

**Story:** PRO-6 — License Key & Feature Gating System

---

## Visão Geral

O AIOX Pro é distribuído por um canal autenticado. O instalador valida a **licença ativa**, solicita uma URL assinada de curta duração ao serviço/repo histórico `aios-license-server` (mantido sob branding AIOX) e instala o artefato premium verificado no projeto.

```text
Comprar Licença -> Validar -> Baixar artefato assinado -> Usar Features Pro
```

### Pacotes npm

| Pacote | Tipo | Propósito |
|--------|------|-----------|
| `@aiox-squads/aiox-pro-cli` | CLI | Comandos de recuperação e compatibilidade |
| `@aiox-squads/pro` | Artefato premium | Pacote Pro canônico, entregue ao cliente pelo artifact broker autenticado |

---

## Instalacao Rapida

```bash
# Instalar AIOX Pro (instala o pacote Pro compatível automaticamente)
npx -y -p @aiox-squads/core@latest aiox pro setup

# Ativar sua licença por chave legada
npx -y -p @aiox-squads/core@latest aiox pro activate --key PRO-XXXX-XXXX-XXXX-XXXX

# Verificar ativação
npx -y -p @aiox-squads/core@latest aiox pro status
```

---

## Passo a Passo

### Pré-requisitos

- Node.js >= 18
- `@aiox-squads/core` >= 5.1.17 instalado no projeto

### Passo 1: Instalar AIOX Pro

```bash
npx -y -p @aiox-squads/core@latest aiox pro setup
```

Isso valida sua licença e instala o artefato canônico `@aiox-squads/pro` no projeto. O cliente não precisa de acesso direto ao pacote privado/restrito no npm.

**Se você já tem o artefato Pro instalado por outro fluxo autorizado**, rode novamente o bootstrap para revalidar e re-scaffoldar o conteúdo Pro:

```bash
npx -y -p @aiox-squads/core@latest aiox pro setup
```

### Passo 2: Ativar Licenca

Apos a compra, voce recebera uma chave no formato `PRO-XXXX-XXXX-XXXX-XXXX`.

```bash
npx -y -p @aiox-squads/core@latest aiox pro activate --key PRO-XXXX-XXXX-XXXX-XXXX
```

Esse comando:
1. Valida a chave contra o License Server (`https://aiox-license-server.vercel.app`)
2. Registra sua maquina (machine ID unico)
3. Salva um cache local criptografado para uso offline

### Passo 3: Verificar

```bash
# Status da licenca
npx -y -p @aiox-squads/core@latest aiox pro status

# Listar features disponiveis
npx -y -p @aiox-squads/core@latest aiox pro features
```

---

## Comandos Disponiveis

| Comando | Descricao |
|---------|-----------|
| `npx -y -p @aiox-squads/core@latest aiox pro setup` | Instala o pacote AIOX Pro compatível no projeto |
| `npx -y -p @aiox-squads/core@latest aiox pro activate --key KEY` | Ativa uma chave de licença |
| `npx -y -p @aiox-squads/core@latest aiox pro status` | Mostra status da licença atual |
| `npx -y -p @aiox-squads/core@latest aiox pro features` | Lista todas as features Pro e disponibilidade |
| `npx -y -p @aiox-squads/core@latest aiox pro validate` | Força revalidação online da licença |
| `npx -y -p @aiox-squads/core@latest aiox pro deactivate` | Desativa a licença nesta máquina |
| `npx -y -p @aiox-squads/core@latest aiox pro help` | Mostra todos os comandos |

---

## Operacao Offline

Apos a instalacao e ativacao, o AIOX Pro funciona offline:

- **30 dias** sem necessidade de revalidacao
- **7 dias de grace period** apos expirar o cache
- Verificacao de features 100% local no dia a dia

A internet so e necessaria para:
1. Ativação inicial (`npx -y -p @aiox-squads/core@latest aiox pro activate`)
2. Revalidacao periodica (automatica a cada 30 dias)
3. Desativação (`npx -y -p @aiox-squads/core@latest aiox pro deactivate`)

---

## CI/CD

Para pipelines, instale e ative usando secrets de ambiente:

**GitHub Actions:**
```yaml
- name: Install AIOX Pro
  run: npx -y -p @aiox-squads/core@latest aiox pro setup

- name: Activate License
  run: npx -y -p @aiox-squads/core@latest aiox pro activate --key ${{ secrets.AIOX_PRO_LICENSE_KEY }}
```

**GitLab CI:**
```yaml
before_script:
  - npx -y -p @aiox-squads/core@latest aiox pro setup
  - npx -y -p @aiox-squads/core@latest aiox pro activate --key ${AIOX_PRO_LICENSE_KEY}
```

---

## Troubleshooting

### Chave de licenca invalida

```
License activation failed: Invalid key format
```

- Verifique o formato: `PRO-XXXX-XXXX-XXXX-XXXX` (4 blocos de 4 caracteres hex)
- Sem espacos extras
- Abra uma issue em https://github.com/SynkraAI/aiox-core/issues se a chave foi fornecida a voce

### Maximo de seats excedido

```
License activation failed: Maximum seats exceeded
```

- Desative a licença na outra máquina: `npx -y -p @aiox-squads/core@latest aiox pro deactivate`
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
│  aiox pro        │<────│  aiox-license-server.vercel.app │<────│ Database │
└─────────────────┘     └─────────────────────────────────┘     └──────────┘
                                                                      │
                                                                      │
                        ┌─────────────────────────────────┐           │
                        │  Admin Dashboard (Vercel)       │───────────┘
                        │  aiox-license-dashboard         │
                        │  Cria/revoga/gerencia licencas  │
                        └─────────────────────────────────┘
```

| Componente | URL | Proposito |
|-----------|-----|-----------|
| License Server | `https://aiox-license-server.vercel.app` | API de ativacao/validacao |
| Admin Dashboard | `https://aiox-license-dashboard.vercel.app` | Gestao de licencas (admin) |
| Database | Supabase PostgreSQL | Armazena licencas e ativacoes |

---

## Suporte

- **Documentacao:** https://synkra.ai/pro/docs
- **Comprar:** https://synkra.ai/pro
- **Suporte:** https://github.com/SynkraAI/aiox-core/issues
- **Issues:** https://github.com/SynkraAI/aiox-core/issues

---

*AIOX Pro Installation Guide v3.0*
*Story PRO-6 — License Key & Feature Gating System*
