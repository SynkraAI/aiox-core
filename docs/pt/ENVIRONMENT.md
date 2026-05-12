<!--
  Tradução: PT-BR
  Original: /docs/en/ENVIRONMENT.md
  Última sincronização: 2026-01-26
-->

# Variáveis de Ambiente

> 🌐 [EN](../ENVIRONMENT.md) | **PT** | [ES](../es/ENVIRONMENT.md)

---

Este documento lista todas as variáveis de ambiente usadas pelo Synkra AIOX e seus componentes.

## Visão Geral

O Synkra AIOX usa variáveis de ambiente para configuração, chaves de API e informações sensíveis. **Nunca faça commit de variáveis de ambiente no repositório.**

## Variáveis de Ambiente Obrigatórias

### Core do Framework

Atualmente, o Synkra AIOX não requer nenhuma variável de ambiente obrigatória para operação básica. Toda a configuração é feita através do `core-config.yaml` e arquivos de configuração dos Squads.

## Variáveis de Ambiente Opcionais

### Integração com GitHub

Se você estiver usando recursos do GitHub CLI:

```bash
GITHUB_TOKEN=your_github_token_here
```

**Nota:** O GitHub CLI (`gh`) gerencia a autenticação automaticamente. Esta variável só é necessária se você estiver usando a API do GitHub diretamente.

### Squads

Alguns Squads podem requerer variáveis de ambiente. Verifique o README de cada Squad para requisitos específicos.

#### ETL Squad

```bash
# Opcional: Chaves de API para fontes de dados
YOUTUBE_API_KEY=your_youtube_api_key
TWITTER_API_KEY=your_twitter_api_key
# ... outras chaves de API de serviços
```

#### Squads Privados

Squads privados (no repositório `aiox-Squads`) podem requerer variáveis de ambiente adicionais. Consulte a documentação de cada Squad.

## Configuração do Arquivo de Ambiente

### Criando o Arquivo `.env`

1. Copie o arquivo de exemplo (se disponível):
   ```bash
   cp .env.example .env
   ```

2. Ou crie um novo arquivo `.env` na raiz do projeto:
   ```bash
   touch .env
   ```

3. Adicione suas variáveis de ambiente:
   ```bash
   # .env
   GITHUB_TOKEN=your_token_here
   YOUTUBE_API_KEY=your_key_here
   ```

### Carregando Variáveis de Ambiente

O Synkra AIOX usa `dotenv` (se instalado) ou o suporte nativo a variáveis de ambiente do Node.js. As variáveis de ambiente são carregadas automaticamente dos arquivos `.env` na raiz do projeto.

**Importante:** O arquivo `.env` está no gitignore e nunca será commitado no repositório.

## Melhores Práticas de Segurança

1. **Nunca faça commit de arquivos `.env`** - Eles são automaticamente ignorados pelo gitignore
2. **Nunca faça commit de chaves de API ou secrets** - Use variáveis de ambiente em vez disso
3. **Use valores diferentes para desenvolvimento e produção** - Crie arquivos `.env.development` e `.env.production`
4. **Rotacione secrets regularmente** - Especialmente se eles podem ter sido expostos
5. **Use ferramentas de gerenciamento de secrets** - Para deploys em produção, considere usar serviços como:
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault
   - GitHub Secrets (para CI/CD)

## Variáveis de Ambiente para CI/CD

Para GitHub Actions e outros pipelines de CI/CD, use o gerenciamento de secrets da plataforma:

### GitHub Actions

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  CUSTOM_SECRET: ${{ secrets.CUSTOM_SECRET }}
```

### Outras Plataformas de CI/CD

Consulte a documentação da sua plataforma para gerenciamento de secrets:
- **GitLab CI:** Use variáveis de CI/CD do GitLab
- **CircleCI:** Use variáveis de ambiente do CircleCI
- **Jenkins:** Use credenciais do Jenkins

## Resolução de Problemas

### Variáveis de Ambiente Não Carregando

1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Verifique a sintaxe do arquivo `.env` (sem espaços ao redor de `=`)
3. Reinicie seu servidor de desenvolvimento/processo
4. Verifique se o `dotenv` está instalado (se necessário)

### Variáveis de Ambiente Faltando

Se você ver erros sobre variáveis de ambiente faltando:
1. Consulte este documento para variáveis obrigatórias
2. Consulte a documentação do Squad
3. Verifique se o arquivo `.env` contém todas as variáveis necessárias
4. Garanta que o arquivo `.env` está no local correto (raiz do projeto)

## Contribuindo

Ao adicionar novas variáveis de ambiente:
1. Documente-as neste arquivo
2. Adicione-as ao `.env.example` (se criar um)
3. Atualize a documentação relevante
4. Garanta que `.env` está no `.gitignore`

---

**Última Atualização:** 2025-11-12
**Story:** 4.8 - Repository Open-Source Migration
