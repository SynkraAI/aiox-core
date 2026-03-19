# f1-ingest-figma-tokens

> **Phase 1, Step 1** — Receber e normalizar tokens do Figma para estrutura intermediaria.

## Metadata

```yaml
task:
  id: f1-ingest-figma-tokens
  phase: 1
  step: 1
  agent: ds-foundations-lead
  delegates_to: ds-token-architect
  blocking: false
  next: f1-map-tokens-to-shadcn
```

## Objetivo

Receber tokens do usuario em qualquer formato suportado e normalizar para uma estrutura JSON intermediaria categorizada.

## Formatos de Input Aceitos

1. **CSS do Dev Mode** — Copy-paste de variaveis CSS do Figma Dev Mode
2. **JSON export** — Tokens Studio ou Figma Variables API export
3. **Texto manual** — Lista `nome: valor` fornecida pelo usuario
4. **Screenshots** — Com validacao humana obrigatoria (marcar valores incertos como `NEEDS_CONFIRMATION`)

## Execution Steps

### Step 1: Solicitar Input

Pergunte ao usuario:

```
Qual formato voce vai usar para os tokens?
1. CSS do Figma Dev Mode (copy-paste)
2. JSON export (Tokens Studio / Variables API)
3. Lista manual (nome: valor)
4. Screenshot (precisa validacao manual)

Cole os tokens aqui:
```

### Step 2: Parse Input

Para cada formato:

- **CSS**: Extrair pares `--nome: valor` de blocos `:root` e `.dark`/`[data-theme]`
- **JSON**: Extrair tokens respeitando hierarquia de grupos
- **Manual**: Parsear linhas `nome: valor` ou `nome = valor`
- **Screenshot**: Solicitar que o usuario confirme cada valor extraido

### Step 3: Categorizar

Organizar tokens nas categorias:

| Categoria | Exemplos |
|-----------|----------|
| `color` | Paletas, semanticos, brand colors |
| `spacing` | Gaps, paddings, margins |
| `typography` | Font family, size, weight, line-height, letter-spacing |
| `radius` | Border radius values |
| `shadow` | Box shadows, drop shadows |
| `opacity` | Alpha values |
| `motion` | Duration, easing (se fornecido) |

### Step 4: Identificar Modos

- Detectar se existem modos (light/dark, brand themes)
- Se apenas um conjunto de valores: assumir `default` mode
- Se dois conjuntos (claro/escuro): mapear como `default` e `dark`

### Step 5: Normalizar Output

Gerar JSON intermediario:

```json
{
  "meta": {
    "source": "figma-dev-mode",
    "inputFormat": "css",
    "timestamp": "2026-02-21T...",
    "modes": ["default", "dark"]
  },
  "tokens": {
    "color": {
      "primitives": {
        "blue-500": { "value": "#3B82F6", "type": "color" }
      },
      "semantic": {
        "primary": { "value": "{color.primitives.blue-500}", "type": "color" },
        "primary-foreground": { "value": "#FFFFFF", "type": "color" }
      }
    },
    "spacing": {},
    "typography": {},
    "radius": {},
    "shadow": {}
  },
  "dark": {
    "color": {
      "semantic": {
        "primary": { "value": "{color.primitives.blue-400}", "type": "color" }
      }
    }
  }
}
```

## Validacao

- [ ] Pelo menos uma categoria de token tem valores
- [ ] Valores de cor sao validos (hex, rgb, hsl, oklch)
- [ ] Nenhum valor vazio ou placeholder
- [ ] Modos identificados corretamente
- [ ] Screenshots tem confirmacao humana

## Output

- Estrutura JSON normalizada (em memoria ou `squads/design/data/tokens-normalized.json`)
- Report de tokens recebidos por categoria

## Referencia

- IO contract de `@ds-token-architect`: `squads/design/agents/ds-token-architect.md` → `io_contract.inputs.accepted_formats`

## Related Checklists

- `squads/design/checklists/token-mapping-checklist.md`
