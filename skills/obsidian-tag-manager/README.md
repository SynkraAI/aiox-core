# Obsidian Tag Manager

Sistema inteligente de gerenciamento de tags para vaults Obsidian com consistência automática e prevenção de duplicatas.

## 🎯 Vault Configurado

**Mente do Fosc** (iCloud)
```
/Users/luizfosc/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mente do Fosc
```

Pronto para uso imediato! A skill já conhece o caminho do seu vault.

## Quick Start

```bash
# Ativar a skill
/AIOS:skills:obsidian-tag-manager

# Ou via Skill tool
Skill: obsidian-tag-manager
```

## O Que Esta Skill Faz

✅ **Extrai** todas as tags existentes do seu vault
✅ **Normaliza** capitalizações inconsistentes
✅ **Previne** duplicatas (ex: `#TypeScript` vs `#typescript`)
✅ **Mantém** consistência com tags existentes
✅ **Aplica** tags no formato YAML frontmatter
✅ **Detecta** e consolida duplicatas
✅ **Sugere** tags baseado no conteúdo

## Casos de Uso Comuns

### 1. Adicionar Tags Mantendo Consistência

```markdown
Usuário: "Adicione tags typescript, react e obsidian a note.md"

Claude:
1. Extrai tags do vault → encontra #TypeScript, #React, #obsidian
2. Normaliza input → typescript → TypeScript (preserva original)
3. Aplica:
---
tags:
  - React
  - TypeScript
  - obsidian
---
```

### 2. Normalizar Tags Existentes

```markdown
Usuário: "Normalize as tags deste arquivo"

Antes:
tags: [typescript, REACT, ObSiDiAn]

Depois:
tags:
  - React
  - TypeScript
  - obsidian
```

### 3. Detectar Duplicatas

```markdown
Usuário: "Verifique duplicatas de tags no vault"

Resultado:
⚠️ TypeScript vs typescript (2 variações)
  - #TypeScript: 15 notas
  - #typescript: 3 notas

Sugestão: Consolidar para #TypeScript
```

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `*extract-tags` | Lista todas as tags do vault |
| `*normalize-tags <file>` | Normaliza tags de um arquivo |
| `*add-tags <file> <tags...>` | Adiciona tags com consistência |
| `*list-duplicates` | Encontra duplicatas |
| `*consolidate-tag <old> <new>` | Consolida duplicatas |
| `*refresh-tags` | Atualiza cache de tags |

## Convenções de Capitalização

A skill segue estas convenções ao criar **novas** tags:

| Tipo | Formato | Exemplos |
|------|---------|----------|
| Tecnologias | PascalCase | TypeScript, React, Node.js |
| Linguagens | PascalCase | Python, JavaScript, Go |
| Conceitos | lowercase | design-patterns, best-practices |
| Categorias | lowercase | tutorial, documentation |
| Hierarquia | mantém estrutura | projeto/backend |

**Importante:** Tags existentes sempre preservam capitalização original.

## Workflow Típico

### Setup Inicial

1. Informar path do vault Obsidian
2. Skill extrai todas as tags existentes
3. Build cache normalizado em memória

### Durante Uso

1. Usuário solicita adicionar/normalizar tags
2. Skill verifica contra tags existentes
3. Aplica tags mantendo consistência
4. Reporta mudanças feitas

## Formato de Output

### Tags aplicadas no YAML frontmatter:

```yaml
---
tags:
  - React
  - TypeScript
  - state-management
---
```

**Características:**
- ✅ Sem `#` (formato Obsidian)
- ✅ Uma tag por linha (legibilidade)
- ✅ Ordenação alfabética
- ✅ Sem duplicatas

## Exemplos Práticos

Ver diretório `examples/` para casos de uso detalhados:

- `examples/basic-usage.md` - Uso básico
- `examples/bulk-operations.md` - Operações em massa
- `examples/duplicate-resolution.md` - Resolver duplicatas
- `examples/hierarchical-tags.md` - Tags hierárquicas

## Integration com AIOS

Combinar com outras skills:

```markdown
# Com @dev para automação
@dev "Use obsidian-tag-manager para adicionar tags em docs/"

# Com systematic-debugging
1. systematic-debugging identifica problema
2. obsidian-tag-manager adiciona tag #bug-fix

# Com git-pushing
1. obsidian-tag-manager normaliza tags
2. @devops commita mudanças
```

## Performance

| Vault Size | Extract Time | Recomendação |
|------------|--------------|--------------|
| < 100 arquivos | ~1s | Extract a cada operação |
| 100-1000 arquivos | ~5s | Cache de 15 min |
| > 1000 arquivos | ~20s | Build index uma vez/sessão |

## Troubleshooting

### Tags não encontradas

```bash
# Verificar se vault usa formato correto
grep -roh '#[a-zA-Z0-9/_-]*' . --include="*.md" | head -10
```

### Encoding issues

```bash
# Forçar UTF-8
export LANG=en_US.UTF-8
```

### Frontmatter corrompido

A skill sempre valida YAML antes de escrever. Se erro, rollback automático.

## Segurança

✅ **Pre-flight checks** antes de modificar arquivos
✅ **Validação YAML** antes de aplicar
✅ **Rollback automático** em caso de erro
✅ **Backup** do frontmatter original
✅ **Permissões** verificadas antes de escrever

## Best Practices

1. **Informar vault path** no início da sessão
2. **Refresh cache** se adicionar muitas notas manualmente
3. **Consolidar duplicatas** regularmente
4. **Usar comandos `*` para operações específicas**
5. **Revisar sugestões** antes de aplicar em massa

## Contribuindo

Melhorias bem-vindas:

- Algoritmos de sugestão de tags
- Integração com plugins Obsidian
- Suporte para aliases de tags
- Export de estatísticas de uso

## Versão

**v1.0** - 2026-02-05

---

**Parte do Synkra AIOS**
*CLI First | Observability Second | UI Third*
