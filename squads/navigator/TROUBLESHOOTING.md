# Guia de Troubleshooting do Navigator

Solucoes para problemas comuns e mensagens de erro.

---

## Indice

- [Falhas no Health Check](#falhas-no-health-check)
- [Problemas de Deteccao de Fase](#problemas-de-deteccao-de-fase)
- [Problemas de Sincronizacao do Roadmap](#problemas-de-sincronizacao-do-roadmap)
- [Problemas com Checkpoints](#problemas-com-checkpoints)
- [Problemas com Git Hooks](#problemas-com-git-hooks)
- [Problemas de Performance](#problemas-de-performance)
- [Mensagens de Erro](#mensagens-de-erro)

---

## Falhas no Health Check

### ❌ Versao do Node.js Falhou na Verificacao

**Erro:**
```
✗ Node.js v16.14.0 (requires >= 18.0.0)
```

**Causa:** Versao do Node.js muito antiga

**Correcao:**
```bash
# Opcao 1: Instalar via nvm
nvm install 20
nvm use 20

# Opcao 2: Baixar de nodejs.org
# Visite https://nodejs.org e instale a versao LTS

# Verificar
node --version  # Deve mostrar v18.x.x ou superior
```

---

### ❌ Git Nao Disponivel

**Erro:**
```
✗ Git: Not found in PATH
```

**Causa:** Git nao instalado ou nao esta no PATH

**Correcao:**
```bash
# macOS
brew install git

# Windows
# Baixe de https://git-scm.com/download/win

# Linux (Ubuntu/Debian)
sudo apt-get install git

# Verificar
git --version
```

---

### ❌ Dependencias NPM Faltando

**Erro:**
```
✗ NPM Dependencies: Missing js-yaml, glob
```

**Causa:** Pacotes npm necessarios nao instalados

**Correcao:**
```bash
# Instalar todos de uma vez
npm install js-yaml glob inquirer

# Ou individualmente
npm install js-yaml
npm install glob
npm install inquirer

# Verificar
npm list js-yaml glob inquirer
```

---

### ❌ Git Hooks Nao Instalados

**Erro:**
```
✗ Git Hooks: Navigator hook not found in .husky/post-commit
```

**Causa:** Husky nao configurado ou hook do Navigator faltando

**Correcao:**
```bash
# Passo 1: Garantir que o Husky esta instalado
npm run prepare

# Passo 2: Instalar hook do Navigator
node squads/navigator/scripts/install-hooks.js install

# Passo 3: Verificar
cat .husky/post-commit
# Deve conter: node squads/navigator/scripts/post-commit-hook.js
```

---

### ❌ Pipeline Map Invalido

**Erro:**
```
✗ Pipeline Map: YAML syntax error at line 42
```

**Causa:** YAML malformado no pipeline map

**Correcao:**
```bash
# Validar sintaxe YAML
cat squads/navigator/data/navigator-pipeline-map.yaml

# Problemas comuns:
# - Indentacao inconsistente (use 2 espacos)
# - Dois-pontos faltando depois das chaves
# - Strings sem aspas com caracteres especiais

# Exemplo de correcao:
# Ruim:  description: Tasks & Features
# Bom: description: "Tasks & Features"
```

---

## Problemas de Deteccao de Fase

### ❌ Fase Errada Detectada

**Problema:** `*where-am-i` mostra Fase 3 mas voce esta na Fase 5

**Causa:** Arquivos de output da Fase 5 nao correspondem aos padroes do pipeline map

**Diagnostico:**
```bash
# 1. Verificar quais arquivos existem
ls docs/stories/story-*.md

# 2. Comparar com outputs do pipeline map
cat squads/navigator/data/navigator-pipeline-map.yaml | grep "outputs:" -A 5

# 3. Verificar se os padroes glob correspondem
```

**Correcao:**
```yaml
# Opcao 1: Atualizar pipeline map para corresponder sua estrutura
# Editar: data/navigator-pipeline-map.yaml
outputs:
  - "docs/stories/story-*.md"  # Deve corresponder aos seus arquivos reais

# Opcao 2: Renomear arquivos para corresponder ao pipeline map
mv docs/user-stories/* docs/stories/
```

---

### ❌ Porcentagem de Conclusao Errada

**Problema:** `*where-am-i` mostra 0% mas stories existem

**Causa:** Arquivos de story sem YAML front-matter ou campo status

**Diagnostico:**
```bash
# Verificar um arquivo de story
head -10 docs/stories/story-7.1.md
```

**Formato esperado:**
```markdown
---
id: story-7.1
title: User authentication
status: completed  # Precisa ter isso!
---

# Conteudo da story...
```

**Correcao:**
```bash
# Adicionar front-matter a todas as stories
# Use este template:
cat > docs/stories/story-X.Y.md <<'EOF'
---
id: story-X.Y
title: Titulo da story
status: pending  # ou: in-progress, completed
---

# Conteudo da story
EOF
```

---

### ❌ Fase Travada (Nao Avanca)

**Problema:** Completou todos os outputs da fase mas `*auto-navigate` nao avanca

**Causa:** Regras de transicao bloqueando o avanco

**Diagnostico:**
```bash
# Verificar bloqueios
*where-am-i | grep "Blockers"
```

**Correcao:**
```bash
# Opcao 1: Resolver o bloqueio
# (ex: corrigir testes falhando, completar stories faltantes)

# Opcao 2: Sobrescrever regra de transicao
# Editar roadmap.md, definir next_phase manualmente
```

---

## Problemas de Sincronizacao do Roadmap

### ❌ Conflitos de Sincronizacao

**Problema:** Roadmaps central e local diferem, sync falha

**Erro:**
```
⚠️  Roadmap sync conflict detected!
Central: modified 2026-02-15 14:30:00
Local: modified 2026-02-15 16:45:00
```

**Correcao:**
```bash
# Opcao 1: Manter versao central
cp .aios/navigator/{project}/roadmap.md docs/roadmap.md

# Opcao 2: Manter versao local
cp docs/roadmap.md .aios/navigator/{project}/roadmap.md

# Opcao 3: Merge manual
# Abrir ambos os arquivos e fazer merge manual
code docs/roadmap.md .aios/navigator/{project}/roadmap.md
```

---

### ❌ Sync Falha Silenciosamente

**Problema:** Commits no git nao disparam sync do roadmap

**Causa:** Hook post-commit nao esta executando

**Diagnostico:**
```bash
# Verificar se hook existe
ls -la .husky/post-commit

# Verificar se hook tem permissao de execucao
stat .husky/post-commit

# Testar hook manualmente
bash .husky/post-commit
```

**Correcao:**
```bash
# Tornar executavel
chmod +x .husky/post-commit

# Verificar se hook do Navigator esta presente
grep "post-commit-hook.js" .husky/post-commit
```

---

## Problemas com Checkpoints

### ❌ Criacao de Checkpoint Falha

**Erro:**
```
Error: ENOENT: no such file or directory
```

**Causa:** Diretorio de checkpoints nao existe

**Correcao:**
```bash
# Criar diretorio de checkpoints
mkdir -p .aios/navigator/{your-project-name}/checkpoints/

# Tentar novamente
@navigator
*checkpoint
```

---

### ❌ Aviso de Checkpoint Duplicado

**Aviso:**
```
⚠️  Checkpoint cp-7-manual-20260215-143022 already exists. Overwrite? (y/n)
```

**Causa:** Checkpoint com mesmo ID existe (raro, mas possivel)

**Correcao:**
```bash
# Opcao 1: Pular (recomendado)
# Pressione 'n' para pular

# Opcao 2: Sobrescrever
# Pressione 'y' para sobrescrever (perde checkpoint anterior)

# Opcao 3: Listar checkpoints primeiro
*checkpoint --list
# Deletar checkpoint antigo se necessario
rm .aios/navigator/{project}/checkpoints/cp-7-manual-20260215-143022.json
```

---

### ❌ Nao Consigo Restaurar Checkpoint

**Erro:**
```
Error: Checkpoint file corrupted or invalid JSON
```

**Causa:** Erro de sintaxe JSON no arquivo de checkpoint

**Correcao:**
```bash
# Validar JSON
cat .aios/navigator/{project}/checkpoints/cp-X-type-timestamp.json | jq .

# Se invalido, restaurar do historico git
git log --all --full-history -- .aios/navigator/{project}/checkpoints/
git checkout <commit-hash> -- .aios/navigator/{project}/checkpoints/cp-X.json
```

---

## Problemas com Git Hooks

### ❌ Hook Falha com Permission Denied

**Erro:**
```
bash: .husky/post-commit: Permission denied
```

**Causa:** Arquivo do hook nao e executavel

**Correcao:**
```bash
chmod +x .husky/post-commit
chmod +x .husky/pre-commit
```

---

### ❌ Hook Bloqueia Commits

**Problema:** Commits travam ou falham por causa do hook

**Diagnostico:**
```bash
# Testar hook manualmente
bash .husky/post-commit
# Verificar erros
```

**Correcao Temporaria:**
```bash
# Pular hooks por um commit
git commit --no-verify -m "message"
```

**Correcao Permanente:**
```bash
# Debugar script do hook
node squads/navigator/scripts/post-commit-hook.js --verbose

# Ou desabilitar hook do Navigator temporariamente
node squads/navigator/scripts/install-hooks.js uninstall
```

---

## Problemas de Performance

### ❌ *where-am-i esta Lento (> 5 segundos)

**Causa:** Muitos arquivos para escanear

**Diagnostico:**
```bash
# Contar arquivos de story
ls docs/stories/story-*.md | wc -l
# Se > 1000, esse e o problema
```

**Correcao:**
```yaml
# Otimizar padroes glob no pipeline map
# Mudar de:
outputs:
  - "docs/**/*.md"  # Muito amplo

# Para:
outputs:
  - "docs/stories/story-*.md"  # Especifico
```

---

### ❌ Sync do Roadmap Causa Lag

**Causa:** Arquivo de roadmap grande (> 10MB)

**Correcao:**
```bash
# Verificar tamanho do arquivo
ls -lh .aios/navigator/{project}/roadmap.md

# Se muito grande, dividir em multiplos arquivos
# Ou comprimir detalhes de fases antigas
```

---

## Mensagens de Erro

### "Cannot read property 'id' of undefined"

**Causa:** ID de fase faltando no roadmap

**Correcao:**
```yaml
# Garantir que todas as fases tem campo id
phases:
  - id: 1  # PRECISA estar presente
    name: Pesquisa
    # ...
```

---

### "YAML parse error: duplicated mapping key"

**Causa:** Chaves duplicadas no YAML

**Correcao:**
```yaml
# Ruim (name duplicado)
phase:
  name: Pesquisa
  name: Research  # DUPLICADO!

# Bom
phase:
  name: Pesquisa
  description: Research phase
```

---

### "Phase transition blocked"

**Causa:** Regra de transicao impedindo avanco

**Correcao:**
```bash
# Verificar regras de transicao no roadmap
cat docs/roadmap.md | grep "transitions:" -A 20

# Resolver a condicao de bloqueio
# Ou remover a regra de bloqueio temporariamente
```

---

### "Git commit not found in checkpoint"

**Causa:** Checkpoint criado fora de repositorio git

**Correcao:**
```bash
# Garantir que esta em um repositorio git
git status

# Se nao estiver, inicializar
git init
git add .
git commit -m "Initial commit"

# Tentar checkpoint novamente
*checkpoint
```

---

## Obtendo Mais Ajuda

### Habilitar Modo Debug

```bash
export NAVIGATOR_DEBUG=true
*where-am-i
# Output verboso com informacoes de debug
```

### Verificar Logs

```bash
# Logs do Navigator (se logging habilitado)
tail -f .aios/logs/navigator.log
```

### Executar Diagnostico Completo

```bash
*navigator-doctor --verbose
# Mostra informacoes detalhadas de diagnostico
```

### Reportar um Bug

Se nenhuma dessas solucoes funcionar:

1. **Verificar issues existentes:** https://github.com/SynkraAI/aios-core/issues
2. **Criar nova issue** com:
   - Mensagem de erro (texto completo)
   - Output de `*navigator-doctor`
   - Passos para reproduzir
   - Ambiente (SO, versao do Node)

---

## Armadilhas Comuns

### ❌ Editar Roadmap Central Diretamente

**Nao faca:**
```bash
# ERRADO: Editando arquivo central diretamente
vim .aios/navigator/{project}/roadmap.md
```

**Faca:**
```bash
# CERTO: Editar copia local, sync cuidara do central
vim docs/roadmap.md
git commit -m "Update roadmap"
# Hook sincroniza para central automaticamente
```

---

### ❌ Ignorar Avisos do Health Check

**Nao faca:** Pular avisos de `*navigator-doctor`

**Faca:** Corrigir todos os avisos antes de prosseguir

---

### ❌ Edicoes Manuais do Roadmap Sem Sync

**Nao faca:** Editar roadmap e esquecer de sincronizar

**Faca:**
```bash
# Depois de edicoes manuais
*update-roadmap --force-sync
```

---

**Ainda travado?** Abra uma issue com detalhes completos do erro: https://github.com/SynkraAI/aios-core/issues

---

*Guia de Troubleshooting do Navigator v1.0*
