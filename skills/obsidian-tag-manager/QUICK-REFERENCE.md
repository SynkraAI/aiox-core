# Quick Reference - Obsidian Tag Manager

Referência rápida de comandos e uso comum da skill.

## Ativação da Skill

```bash
# Via Skill tool
Skill: obsidian-tag-manager

# Via path completo
/AIOS:skills:obsidian-tag-manager
```

## Comandos Principais

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `*extract-tags` | Lista todas as tags do vault | `*extract-tags` |
| `*add-tags <file> <tags>` | Adiciona tags a um arquivo | `*add-tags note.md react typescript` |
| `*normalize-tags <file>` | Normaliza tags de um arquivo | `*normalize-tags note.md` |
| `*normalize-all <dir>` | Normaliza todos arquivos de uma pasta | `*normalize-all docs/` |
| `*list-duplicates` | Detecta duplicatas | `*list-duplicates` |
| `*consolidate-tag <old> <new>` | Consolida duplicatas | `*consolidate-tag typescript TypeScript` |
| `*remove-tag <tag> <dir>` | Remove tag de uma pasta | `*remove-tag deprecated docs/` |
| `*migrate-tag <old> <new>` | Migra tag antiga para nova | `*migrate-tag OldName NewName` |
| `*auto-tag <dir>` | Auto-tag baseado em conteúdo | `*auto-tag docs/tutorials/` |
| `*list-untagged <dir>` | Lista arquivos sem tags | `*list-untagged docs/` |
| `*tag-stats <dir>` | Estatísticas de tags | `*tag-stats docs/` |
| `*refresh-tags` | Atualiza cache de tags | `*refresh-tags` |

## Fluxos de Trabalho Comuns

### 1. Adicionar Tags a Nota Nova

```markdown
User: "Adicione tags react, typescript e hooks"

Claude:
1. Extrai tags do vault
2. Normaliza: react → React, typescript → TypeScript
3. Aplica no frontmatter
```

**Output:**
```yaml
---
tags:
  - React
  - TypeScript
  - hooks
---
```

### 2. Corrigir Tags Inconsistentes

```bash
# Detectar
*list-duplicates

# Consolidar
*consolidate-tag typescript TypeScript
```

### 3. Processar Pasta Inteira

```bash
# Adicionar tag categoria a todos
*add-tag-to-directory docs/tutorials/ tutorial

# Normalizar tudo
*normalize-all docs/tutorials/
```

### 4. Auto-Tag por Conteúdo

```bash
*auto-tag docs/tutorials/
```

### 5. Migrar Tags de Projeto

```bash
# Renomear projeto em todas as notas
*migrate-tag OldProjectName NewProjectName docs/
```

## Convenções de Capitalização

| Tipo | Formato | Exemplos |
|------|---------|----------|
| Tecnologias | PascalCase | TypeScript, React, Node.js |
| Linguagens | PascalCase | Python, JavaScript, Go |
| Conceitos | lowercase | design-patterns, best-practices |
| Categorias | lowercase | tutorial, documentation, reference |
| Projetos | PascalCase/kebab | AIOS, ecoflow-design-system |
| Hierarquia | mantém estrutura | projeto/backend, area/subtopico |

**Regra de Ouro:** Tags existentes SEMPRE preservam capitalização original.

## Formato de Tags

### No Arquivo (Inline)

```markdown
# Título da Nota

Conteúdo com #TypeScript e #React inline.
```

### No Frontmatter (Recomendado)

```yaml
---
tags:
  - React
  - TypeScript
  - tutorial
---
```

**Características:**
- Sem `#` no frontmatter
- Uma tag por linha
- Ordenação alfabética
- Multiline YAML (não array inline)

## Casos de Uso por Persona

### Desenvolvedor

```bash
# Adicionar tags técnicas
*add-tags note.md typescript react node.js

# Organizar por tecnologia
*auto-tag projects/
```

### Escritor/Pesquisador

```bash
# Categorizar conteúdo
*add-tags article.md tutorial research published

# Encontrar duplicatas
*list-duplicates
```

### Gerente de Conhecimento

```bash
# Normalizar vault inteiro
*normalize-all .

# Estatísticas
*tag-stats .

# Consolidar inconsistências
*consolidate-all-duplicates
```

## Troubleshooting Rápido

### Tags não encontradas

```bash
# Verificar formato
grep -roh '#[a-zA-Z0-9/_-]*' . --include="*.md" | head -10
```

### Cache desatualizado

```bash
*refresh-tags
```

### Frontmatter corrompido

```markdown
Skill valida YAML automaticamente.
Se erro, rollback automático aplicado.
```

### Permissão negada

```bash
# Verificar permissões
ls -la arquivo.md

# Corrigir
chmod 644 arquivo.md
```

## Keyboard Shortcuts (Se Configurado)

| Atalho | Ação |
|--------|------|
| `Cmd+Shift+T` | Adicionar tags à nota atual |
| `Cmd+Shift+N` | Normalizar tags da nota atual |
| `Cmd+Shift+D` | Detectar duplicatas |

*Nota: Shortcuts requerem configuração no Obsidian*

## Integração com Outros Comandos

### Com Git

```bash
# Normalizar e commitar
*normalize-all docs/
git add . && git commit -m "chore: normalize tags"
```

### Com Busca

```bash
# Encontrar todas as notas com tag
grep -r "tags:" . --include="*.md" | grep "TypeScript"
```

### Com Estatísticas

```bash
# Contar notas por tag
*tag-stats . | sort -rn
```

## Performance Tips

| Vault Size | Recomendação |
|------------|--------------|
| < 100 arquivos | Extract a cada operação |
| 100-1000 arquivos | Cache de 15 min |
| > 1000 arquivos | Build index uma vez/sessão |

## Exemplo de Sessão Completa

```markdown
# Início da sessão
User: "Preciso organizar as tags do meu vault Obsidian"

Claude: "Qual é o caminho do seu vault?"

User: "/Users/user/Documents/ObsidianVault"

# Skill extrai tags
Claude: "Encontrei 45 tags únicas em 230 notas.
         Detectadas 3 duplicatas potenciais."

# Usuário resolve duplicatas
User: "*list-duplicates"

Claude: [mostra duplicatas]

User: "*consolidate-tag typescript TypeScript"

Claude: "✅ 12 arquivos atualizados"

# Usuário normaliza pasta
User: "*normalize-all docs/tutorials/"

Claude: "✅ 25 arquivos normalizados, 8 inconsistências corrigidas"

# Usuário adiciona tags a nova nota
User: "Adicione tags react, typescript e hooks a new-note.md"

Claude: "✅ Tags aplicadas:
- React (match com vault)
- TypeScript (match com vault)
- hooks (nova tag criada)"

# Fim da sessão
User: "Obrigado!"

Claude: "Vault agora 95% consistente! 🎉"
```

## Métricas de Saúde do Vault

Após normalização, você pode ver:

```markdown
## Saúde do Vault

**Consistência de Tags:** 95%
- Tags únicas: 42
- Tags duplicadas: 2 (5%)
- Capitalizações inconsistentes: 0

**Cobertura:**
- Notas com tags: 220/230 (96%)
- Notas sem tags: 10 (4%)
- Média de tags/nota: 2.3

**Top 10 Tags:**
1. #TypeScript - 45 notas
2. #React - 38 notas
3. #tutorial - 35 notas
4. #JavaScript - 30 notas
5. #Node.js - 25 notas
...

**Recomendações:**
- Consolidar 2 duplicatas restantes
- Adicionar tags às 10 notas sem tags
- Considerar tags hierárquicas para organização
```

## Recursos Adicionais

- **Documentação completa:** `skill.md`
- **Exemplos detalhados:** `examples/`
- **README:** `README.md`

## Versão

**v1.0** - 2026-02-05

---

**Tip:** Use `*help` durante a skill para ver comandos disponíveis contextualizados.
