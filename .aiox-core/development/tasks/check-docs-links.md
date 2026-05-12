# check-docs-links

Verifica a integridade dos links internos na documentação markdown.

## Metadata

```yaml
id: check-docs-links
name: Check Documentation Links
category: quality
agent: devops
elicit: false
```

## Description

Valida todos os links internos em arquivos markdown no diretório `docs/`. Detecta:

1. **Links quebrados** - apontam para arquivos que não existem
2. **Marcações incorretas** - marcados "coming soon" mas arquivo existe
3. **Conteúdo planejado** - links marcados "coming soon" (roadmap)

## Usage

```bash
# Relatório completo
python scripts/check-markdown-links.py

# Resumo rápido (para CI)
python scripts/check-markdown-links.py --summary

# Output JSON (para integração)
python scripts/check-markdown-links.py --json

# Auto-corrigir problemas
python scripts/check-markdown-links.py --fix
```

## Exit Codes

| Code | Meaning                                          |
| ---- | ------------------------------------------------ |
| 0    | Todos os links válidos (ou apenas "coming soon") |
| 1    | Links quebrados encontrados                      |
| 2    | Marcações incorretas encontradas                 |

## CI Integration

Adicionar ao GitHub Actions:

```yaml
- name: Check documentation links
  run: python scripts/check-markdown-links.py --summary
```

## Workflow

### Verificação Manual

1. Rodar o script: `python scripts/check-markdown-links.py`
2. Analisar o relatório
3. Para links quebrados:
   - Se o conteúdo será criado: adicionar ` *(coming soon)*` após o link
   - Se o link está errado: corrigir o path
4. Para marcações incorretas:
   - Remover ` *(coming soon)*` do link

### Auto-fix

O modo `--fix` automaticamente:

- Adiciona ` *(coming soon)*` em links quebrados
- Remove ` *(coming soon)*` de links para arquivos existentes

```bash
python scripts/check-markdown-links.py --fix
```

## Output Example

```
======================================================================
MARKDOWN LINK VERIFICATION REPORT
======================================================================

## 1. BROKEN LINKS (no 'coming soon' marker): 5
------------------------------------------------------------
  docs/guide.md:42 -> ./missing-file.md
  docs/api/index.md:15 -> ../tutorials/setup.md

## 2. INCORRECT: File EXISTS but marked 'coming soon': 2
------------------------------------------------------------
  docs/readme.md:10 -> ./existing-file.md

## 3. PLANNED CONTENT: Links marked 'coming soon': 12
------------------------------------------------------------
  ./future-feature.md (3 refs)
  ../roadmap/v3.md (2 refs)

======================================================================
SUMMARY
======================================================================
  Files scanned: 150
  Valid links: 423
  Broken links (ACTION: mark coming soon): 5
  Incorrect markings (ACTION: remove coming soon): 2
  Planned content (coming soon): 12
  Unique destinations to create: 8
```

## Related

- `scripts/check-markdown-links.py` - Script de verificação
- `docs/` - Diretório de documentação
