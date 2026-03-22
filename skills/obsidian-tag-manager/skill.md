---
paths:
  - "skills/obsidian-tag-manager/"
lazy_load: true
context_budget: 3142
---

# Obsidian Tag Manager

Expert em gerenciamento inteligente de tags para Obsidian vaults. Analisa tags existentes, mantém consistência de capitalização e evita duplicatas.

## Configuração do Vault

**Vault Path Padrão:** `/Users/luizfosc/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc`

Este é o vault configurado para uso automático. Se necessário trabalhar com outro vault, o caminho pode ser especificado manualmente.

## Quando Usar Esta Skill

Use quando o usuário solicitar:
- "Adicione tags a esta nota do Obsidian"
- "Organize as tags deste arquivo"
- "Normalize as tags do vault"
- "Liste todas as tags do Obsidian"
- "Verifique tags duplicadas"
- "Padronize capitalização das tags"

## Capabilities

1. **Tag Discovery**: Extrai todas as tags existentes do vault
2. **Smart Matching**: Matching case-insensitive com preservação do original
3. **Consistency Enforcement**: Evita duplicatas com capitalizações diferentes
4. **Tag Normalization**: Padroniza formato e estrutura
5. **Frontmatter Integration**: Aplica tags no YAML frontmatter
6. **Hierarchy Support**: Respeita tags aninhadas (ex: `#projeto/backend`)

---

## Core Behavior

### 1. Tag Extraction Algorithm

**Sempre comece extraindo tags existentes do vault:**

```bash
# Extract all existing tags from markdown files
grep -roh '#[a-zA-Z0-9/_-]*' /path/to/vault --include="*.md" | sort -u
```

**Output esperado:**
```
#Angular
#React
#TypeScript
#obsidian
#projeto/backend
#projeto/frontend
```

### 2. Tag Normalization Map

Após extrair, criar mapa normalizado em memória:

```typescript
// Estrutura do mapa
{
  "angular": "#Angular",
  "react": "#React",
  "typescript": "#TypeScript",
  "obsidian": "#obsidian",
  "projeto/backend": "#projeto/backend",
  "projeto/frontend": "#projeto/frontend"
}
```

**Regras de normalização:**
- Key: lowercase sem `#`
- Value: tag original completa com `#` e capitalização exata

### 3. Tag Matching Process

Para cada tag proposta pelo usuário:

1. **Clean**: Remover `#` se presente
2. **Normalize**: Converter para lowercase
3. **Lookup**: Buscar no mapa normalizado
4. **Return**:
   - Se existe → retornar versão original (ex: `#TypeScript`)
   - Se não existe → criar nova com capitalização sugerida

### 4. Tag Application

**Formato preferido: YAML Frontmatter**

```yaml
---
tags:
  - TypeScript
  - React
  - obsidian
---
```

**Regras de aplicação:**
- Sempre no topo do arquivo
- Um tag por linha (legibilidade)
- Ordenação alfabética
- Sem duplicatas
- Sem `#` no frontmatter (formato Obsidian)

---

## Workflow Completo

### Step 1: Descobrir Vault Path

Perguntar ao usuário se necessário:

```markdown
Para gerenciar as tags, preciso do caminho do seu vault Obsidian.

Qual é o caminho completo? (ex: `/Users/nome/Documents/ObsidianVault`)
```

### Step 2: Extract Existing Tags

```bash
cd /path/to/vault
grep -roh '#[a-zA-Z0-9/_-]*' . --include="*.md" | sort -u > /tmp/obsidian-tags.txt
```

### Step 3: Build Normalization Map

```markdown
Encontrei as seguintes tags no vault:

- #TypeScript (15 notas)
- #React (8 notas)
- #obsidian (3 notas)
- #projeto/backend (5 notas)

Total: 4 tags únicas
```

### Step 4: Process User Request

**Exemplo de input:**
```
Usuário: "Adicione tags typescript, react, vue e obsidian"
```

**Processing:**
1. `typescript` → normaliza para `typescript` → encontra `#TypeScript` → usa `TypeScript`
2. `react` → normaliza para `react` → encontra `#React` → usa `React`
3. `vue` → normaliza para `vue` → NÃO encontra → cria `Vue` (PascalCase sugerido)
4. `obsidian` → normaliza para `obsidian` → encontra `#obsidian` → usa `obsidian`

**Output:**
```yaml
---
tags:
  - React
  - TypeScript
  - Vue
  - obsidian
---
```

### Step 5: Apply to File

Se arquivo já tem frontmatter:
- Atualizar seção `tags:`
- Preservar outros campos (title, date, etc.)

Se arquivo não tem frontmatter:
- Criar novo no topo
- Adicionar apenas `tags:`

---

## Tag Capitalization Conventions

Ao criar **novas tags**, siga estas convenções:

| Tipo | Formato | Exemplos |
|------|---------|----------|
| Tecnologias | PascalCase | `TypeScript`, `React`, `Node.js` |
| Linguagens | PascalCase | `Python`, `JavaScript`, `Go` |
| Conceitos | lowercase | `design-patterns`, `best-practices` |
| Categorias | lowercase | `tutorial`, `documentation`, `reference` |
| Projetos | PascalCase ou kebab-case | `AIOS`, `ecoflow-design-system` |
| Hierarquia | mantém estrutura | `projeto/backend`, `area/subtopico` |

**Importante:** Se tag existente usar formato diferente, SEMPRE preservar o original.

---

## Commands

### `*extract-tags`
Extrai e lista todas as tags do vault.

**Output:**
```markdown
## Tags do Vault (4 únicas)

### Por Frequência
1. #TypeScript (15 notas)
2. #React (8 notas)
3. #projeto/backend (5 notas)
4. #obsidian (3 notas)

### Por Categoria
**Tecnologias:** TypeScript, React
**Projetos:** projeto/backend
**Ferramentas:** obsidian
```

### `*normalize-tags <file>`
Normaliza tags de um arquivo específico.

**Processo:**
1. Ler tags atuais do arquivo
2. Verificar contra mapa normalizado
3. Substituir por versões consistentes
4. Aplicar no frontmatter

### `*add-tags <file> <tags...>`
Adiciona tags a um arquivo mantendo consistência.

**Exemplo:**
```bash
*add-tags note.md typescript react obsidian
```

### `*list-duplicates`
Identifica tags com capitalizações diferentes.

**Output:**
```markdown
## Duplicatas Encontradas

⚠️ TypeScript vs typescript (2 variações)
  - #TypeScript: 15 notas
  - #typescript: 3 notas

  Sugestão: Consolidar para #TypeScript
```

### `*consolidate-tag <old> <new>`
Consolida tag duplicada.

**Exemplo:**
```bash
*consolidate-tag typescript TypeScript
```

**Ação:**
1. Encontrar todas as notas com `#typescript`
2. Substituir por `#TypeScript`
3. Atualizar frontmatter
4. Reportar arquivos modificados

---

## Examples

### Example 1: Adicionar Tags a Nova Nota

**Input:**
```markdown
User: "Adicione tags typescript, react e state-management a esta nota"

[nota sem tags]
```

**Process:**
1. Extract vault tags → encontra `#TypeScript`, `#React`
2. Normalize:
   - `typescript` → `#TypeScript` (existe)
   - `react` → `#React` (existe)
   - `state-management` → `#state-management` (nova - kebab-case)
3. Apply to file

**Output:**
```yaml
---
tags:
  - React
  - TypeScript
  - state-management
---

[conteúdo da nota]
```

### Example 2: Normalizar Tags Existentes

**Input:**
```yaml
---
tags: [typescript, REACT, ObSiDiAn]
---
```

**Process:**
1. Extract vault tags → `#TypeScript`, `#React`, `#obsidian`
2. Normalize cada tag:
   - `typescript` → `TypeScript`
   - `REACT` → `React`
   - `ObSiDiAn` → `obsidian`

**Output:**
```yaml
---
tags:
  - React
  - TypeScript
  - obsidian
---
```

### Example 3: Detectar e Resolver Duplicatas

**Input:**
```
User: "Verifique duplicatas de tags"
```

**Process:**
1. Extract all tags
2. Build normalized map
3. Find collisions (multiple tags → same normalized key)

**Output:**
```markdown
## Análise de Duplicatas

⚠️ Encontradas 2 duplicatas:

### 1. TypeScript (inconsistente)
- `#TypeScript` → 12 notas
- `#typescript` → 3 notas
- `#TYPESCRIPT` → 1 nota

**Recomendação:** Consolidar para `#TypeScript`
**Comando:** `*consolidate-tag typescript,TYPESCRIPT TypeScript`

### 2. React (inconsistente)
- `#React` → 8 notas
- `#react` → 2 notas

**Recomendação:** Consolidar para `#React`
**Comando:** `*consolidate-tag react React`

---

Total: 16 notas precisam de normalização
```

---

## Edge Cases

### Hierarchical Tags

**Input:** `#projeto/backend/api`

**Handling:**
- Preservar estrutura completa
- Normalizar cada segmento separadamente
- Matching considera caminho completo

```typescript
// Normalized map entry
"projeto/backend/api": "#projeto/backend/api"

// Match examples
"Projeto/Backend/API" → "#projeto/backend/api" (exists)
"projeto/backend/graphql" → "#projeto/backend/graphql" (new)
```

### Special Characters

**Permitidos:** `a-zA-Z0-9/_-`
**Não permitidos:** espaços, pontuação (exceto `-` e `/`)

**Tratamento:**
```markdown
Input: "web development"
Clean: "web-development"
Output: #web-development
```

### Empty or Invalid Tags

**Ignorar silenciosamente:**
- Tags vazias (`#`)
- Tags só com espaços
- Tags com caracteres inválidos

**Reportar ao usuário:**
```markdown
⚠️ Tags inválidas ignoradas:
- "web development" → convertido para "web-development"
- "#" → removido (vazio)
```

---

## Cache Strategy

Para performance, manter cache da sessão:

```markdown
## Session Cache

**Vault Path:** `/Users/luizfosc/Documents/Obsidian`
**Tags Loaded:** 2026-02-05 14:30
**Total Tags:** 24
**Last Refresh:** 5 min ago

[mapa normalizado em memória]
```

**Refresh quando:**
- Usuário solicita explicitamente (`*refresh-tags`)
- Cache mais antigo que 15 minutos
- Novo vault path fornecido

---

## Output Format

### Sempre forneça feedback claro:

```markdown
✅ Tags aplicadas com sucesso

**Arquivo:** `note.md`
**Tags adicionadas:** React, TypeScript, state-management
**Tags existentes preservadas:** obsidian

**Mudanças:**
```diff
---
+tags:
+  - React
+  - TypeScript
+  - obsidian
+  - state-management
---
```

**Estatísticas:**
- 3 tags matched com vault existente
- 1 tag nova criada (state-management)
- 0 duplicatas detectadas
```

---

## Safety & Validation

### Pre-Flight Checks

Antes de modificar arquivos:

1. ✅ Vault path válido
2. ✅ Arquivo existe e é `.md`
3. ✅ Arquivo tem permissão de escrita
4. ✅ Backup do frontmatter original (se existe)

### Rollback

Se erro durante aplicação:

```markdown
❌ Erro ao aplicar tags

**Erro:** Permission denied
**Arquivo:** note.md
**Ação:** Frontmatter original preservado

**Rollback disponível:** Nenhuma mudança foi feita
```

---

## Integration com AIOS

Esta skill pode ser combinada com outras:

```markdown
# Combinar com @dev para automação
@dev "Use obsidian-tag-manager para adicionar tags TypeScript e React em todos os arquivos de docs/tutorials/"

# Combinar com systematic-debugging
Skill: systematic-debugging
→ Identifica problema
→ obsidian-tag-manager adiciona tag #bug-fix

# Combinar com git-pushing
1. obsidian-tag-manager normaliza todas as tags
2. @devops commita: "chore: normalize Obsidian tags"
```

---

## Advanced Features

### Tag Suggestions

Analisar conteúdo da nota e sugerir tags:

```markdown
## Análise da Nota

**Conteúdo detectado:**
- Menciona "TypeScript" 5 vezes
- Menciona "React hooks" 3 vezes
- Código em `.tsx`

**Tags sugeridas:**
- TypeScript (alta confiança - já existe no vault)
- React (alta confiança - já existe no vault)
- hooks (média confiança - nova tag)
- tutorial (baixa confiança - baseado em estrutura)

Deseja aplicar estas tags? [Y/n]
```

### Bulk Operations

```markdown
*normalize-all-tags /path/to/vault

## Processando Vault

📊 Analisando 156 arquivos .md...

**Progresso:**
[████████████████████░░] 85% (132/156)

**Mudanças detectadas:**
- 23 arquivos com duplicatas
- 12 arquivos sem frontmatter
- 8 arquivos com formato inconsistente

**Estimativa:** 43 arquivos serão modificados

Continuar? [Y/n]
```

---

## Troubleshooting

### Problema: Tags não encontradas

**Sintoma:** Grep retorna vazio

**Solução:**
1. Verificar path do vault
2. Confirmar uso de `#tag` (não apenas `tag`)
3. Verificar permissões de leitura

### Problema: Encoding issues

**Sintoma:** Tags com caracteres especiais quebram

**Solução:**
```bash
# Use UTF-8 explicitly
grep -roh '#[a-zA-Z0-9/_-]*' . --include="*.md" | iconv -f UTF-8 -t UTF-8
```

### Problema: Frontmatter corrompido

**Sintoma:** YAML inválido após aplicar tags

**Solução:**
1. Validar YAML antes de escrever
2. Escapar caracteres especiais
3. Rollback se validação falhar

---

## Best Practices

1. **Sempre extract tags primeiro** - Garante consistência
2. **Cache na sessão** - Evita múltiplos scans
3. **Validar antes de aplicar** - Pre-flight checks
4. **Feedback claro** - Mostre o que foi feito
5. **Preservar original** - Nunca sobrescreva tags existentes sem avisar
6. **Ordenação alfabética** - Facilita leitura
7. **Um tag por linha** - Melhor diff no git
8. **Sem `#` no frontmatter** - Formato padrão Obsidian

---

## Performance Considerations

**Vault pequeno (< 100 arquivos):**
- Extract completo a cada operação: ~1s

**Vault médio (100-1000 arquivos):**
- Cache de 15 minutos: refresh apenas quando necessário

**Vault grande (> 1000 arquivos):**
- Build index uma vez por sessão
- Incremental updates apenas
- Considerar `.obsidian/cache` se disponível

---

*Obsidian Tag Manager v1.0*
*Mantém consistência e organização perfeita das suas tags*
