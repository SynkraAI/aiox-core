<!--
  Tradução: PT-BR
  Original: /docs/en/migration-guide.md
  Última sincronização: 2026-01-26
-->

# Guia de Atualização do Synkra AIOX

> 🌐 [EN](../migration-guide.md) | **PT** | [ES](../es/migration-guide.md)

---

Este guia ajuda você a atualizar entre versões do Synkra AIOX.

## Sumário

1. [Compatibilidade de Versões](#compatibilidade-de-versões)
2. [Checklist Pré-Atualização](#checklist-pré-atualização)
3. [Procedimentos de Backup](#procedimentos-de-backup)
4. [Processo de Atualização](#processo-de-atualização)
5. [Verificação Pós-Atualização](#verificação-pós-atualização)
6. [Procedimentos de Rollback](#procedimentos-de-rollback)
7. [Solução de Problemas](#solução-de-problemas)

## Compatibilidade de Versões

### Versão Atual

**Synkra AIOX v4.2.11** (Versão Estável Atual)

### Caminhos de Atualização

| Da Versão | Para Versão | Tipo de Atualização | Dificuldade |
|-----------|-------------|---------------------|-------------|
| v4.3.x | v4.2.11 | Menor | Baixa |
| v4.0-4.2 | v4.2.11 | Menor | Média |
| v3.x | v4.2.11 | Maior | Alta |

### Requisitos do Sistema

- **Node.js**: 20.0.0 ou superior (recomendado)
- **npm**: 10.0.0 ou superior
- **Git**: 2.0.0 ou superior
- **Espaço em Disco**: mínimo de 100MB de espaço livre

## Checklist Pré-Atualização

Antes de atualizar, certifique-se de que você:

- [ ] Fez backup de todo o seu projeto
- [ ] Documentou as configurações personalizadas
- [ ] Listou todos os agentes e workflows ativos
- [ ] Exportou quaisquer dados críticos
- [ ] Testou a atualização em um ambiente de desenvolvimento
- [ ] Informou os membros da equipe sobre a manutenção planejada
- [ ] Revisou as notas de lançamento para mudanças que quebram compatibilidade

## Procedimentos de Backup

### 1. Backup Completo do Projeto

```bash
# Criar backup com timestamp
tar -czf aiox-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  .

# Mover para local seguro
mv aiox-backup-*.tar.gz ../backups/
```

### 2. Exportar Configuração

```bash
# Salvar configuração atual
cp .aiox-core/config.json ../backups/config-backup.json

# Salvar componentes personalizados
cp -r .aiox-core/agents/custom ../backups/custom-agents/
cp -r .aiox-core/tasks/custom ../backups/custom-tasks/
```

### 3. Documentar Estado Atual

```bash
# Registrar versão atual
npm list aiox-core/core > ../backups/version-info.txt

# Listar arquivos personalizados
find .aiox-core -name "*.custom.*" -type f > ../backups/custom-files.txt
```

## Processo de Atualização

### Opção 1: Atualização In-Place (Recomendada)

```bash
# 1. Parar quaisquer processos em execução
# Fechar todas as integrações de IDE e agentes ativos

# 2. Atualizar para a versão mais recente
npm install -g aiox-core@latest

# 3. Executar comando de atualização
aiox upgrade

# 4. Verificar instalação
aiox --version
```

### Opção 2: Instalação Limpa

```bash
# 1. Remover instalação antiga
npm uninstall -g aiox-core

# 2. Limpar cache
npm cache clean --force

# 3. Instalar versão mais recente
npm install -g aiox-core@latest

# 4. Reinicializar projeto
cd your-project
aiox init --upgrade
```

### Opção 3: Atualização Específica do Projeto

```bash
# Atualizar dependências do projeto
cd your-project
npm update aiox-core/core

# Reinstalar dependências
npm install

# Verificar atualização
npm list aiox-core/core
```

## Verificação Pós-Atualização

### 1. Verificar Instalação

```bash
# Verificar versão
aiox --version

# Verificar componentes principais
aiox verify --components

# Testar funcionalidade básica
aiox test --quick
```

### 2. Testar Agentes

```bash
# Listar agentes disponíveis
aiox list agents

# Testar ativação de agente
aiox test agent aiox-developer

# Verificar dependências dos agentes
aiox verify --agents
```

### 3. Verificar Configuração

```bash
# Validar configuração
aiox config validate

# Revisar log de atualização
cat .aiox-core/logs/upgrade.log
```

### 4. Testar Workflows

```bash
# Listar workflows
aiox list workflows

# Testar execução de workflow
aiox test workflow basic-dev-cycle
```

## Procedimentos de Rollback

Se você encontrar problemas após a atualização:

### Rollback Rápido

```bash
# Restaurar do backup
cd ..
rm -rf current-project
tar -xzf backups/aiox-backup-YYYYMMDD-HHMMSS.tar.gz

# Reinstalar versão anterior
npm install -g aiox-core@<previous-version>

# Verificar rollback
aiox --version
```

### Rollback Seletivo

```bash
# Restaurar componentes específicos
cp ../backups/config-backup.json .aiox-core/config.json
cp -r ../backups/custom-agents/* .aiox-core/agents/custom/

# Reinstalar dependências
npm install
```

## Solução de Problemas

### Problemas Comuns

#### Falha na Instalação

```bash
# Limpar cache do npm
npm cache clean --force

# Tentar com log detalhado
npm install -g aiox-core@latest --verbose

# Verificar permissões do npm
npm config get prefix
```

#### Agentes Não Carregam

```bash
# Reconstruir manifestos dos agentes
aiox rebuild --manifests

# Verificar dependências dos agentes
aiox verify --agents --verbose

# Verificar sintaxe dos agentes
aiox validate agents
```

#### Erros de Configuração

```bash
# Validar configuração
aiox config validate --verbose

# Redefinir para padrões (cuidado!)
aiox config reset --backup

# Reparar configuração
aiox config repair
```

#### Problemas na Camada de Memória

```bash
# Reconstruir índices de memória
aiox memory rebuild

# Verificar integridade da memória
aiox memory verify

# Limpar e reinicializar
aiox memory reset
```

### Obtendo Ajuda

Se você encontrar problemas não cobertos aqui:

1. **Verificar Logs**: Revise `.aiox-core/logs/upgrade.log`
2. **Issues no GitHub**: [github.com/SynkraAI/aiox-core/issues](https://github.com/SynkraAI/aiox-core/issues)
3. **Comunidade Discord**: [discord.gg/gk8jAdXWmj](https://discord.gg/gk8jAdXWmj)
4. **Documentação**: [diretório docs](./getting-started.md)

## Notas Específicas por Versão

### Atualizando para v4.2

**Principais Mudanças:**
- Capacidades aprimoradas do meta-agente
- Desempenho melhorado da camada de memória
- Recursos de segurança atualizados
- Processo de instalação simplificado

**Mudanças que Quebram Compatibilidade:**
- Nenhuma (compatível com versões anteriores a partir da v4.0+)

**Novos Recursos:**
- Melhorias no meta-agente `aiox-developer`
- Assistente de instalação interativo
- Ferramentas de monitoramento de desempenho

**Descontinuações:**
- Sintaxe de comandos legados (ainda suportada com avisos)

---

**Última Atualização:** 2025-08-01
**Versão Atual:** v4.2.11
