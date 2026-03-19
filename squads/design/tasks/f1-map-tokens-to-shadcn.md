# f1-map-tokens-to-shadcn

> **Phase 1, Step 2** — Mapear tokens normalizados do Figma para CSS vars do shadcn em OKLch.

## Metadata

```yaml
task:
  id: f1-map-tokens-to-shadcn
  phase: 1
  step: 2
  agent: ds-foundations-lead
  depends_on: f1-ingest-figma-tokens
  blocking: false
  next: f1-apply-foundations
```

## Objetivo

Transformar os tokens normalizados na Step 1 em mapeamento direto para as CSS variables que o shadcn/UI usa, convertendo todos os valores de cor para OKLch.

## shadcn CSS Variables (Target)

Todas estas variaveis DEVEM ter mapeamento:

### Core (obrigatorio)

| CSS Variable | Descricao | Padrao Light | Padrao Dark |
|---|---|---|---|
| `--background` | Fundo da pagina | oklch(1 0 0) | oklch(0.145 0 0) |
| `--foreground` | Texto principal | oklch(0.145 0 0) | oklch(0.985 0 0) |
| `--card` | Fundo de cards | oklch(1 0 0) | oklch(0.205 0 0) |
| `--card-foreground` | Texto em cards | oklch(0.145 0 0) | oklch(0.985 0 0) |
| `--popover` | Fundo de popovers | oklch(1 0 0) | oklch(0.205 0 0) |
| `--popover-foreground` | Texto em popovers | oklch(0.145 0 0) | oklch(0.985 0 0) |
| `--primary` | Cor primaria | oklch(0.205 0 0) | oklch(0.922 0 0) |
| `--primary-foreground` | Texto sobre primaria | oklch(0.985 0 0) | oklch(0.205 0 0) |
| `--secondary` | Cor secundaria | oklch(0.97 0 0) | oklch(0.269 0 0) |
| `--secondary-foreground` | Texto sobre secundaria | oklch(0.205 0 0) | oklch(0.985 0 0) |
| `--muted` | Fundo atenuado | oklch(0.97 0 0) | oklch(0.269 0 0) |
| `--muted-foreground` | Texto atenuado | oklch(0.556 0 0) | oklch(0.708 0 0) |
| `--accent` | Cor de destaque | oklch(0.97 0 0) | oklch(0.269 0 0) |
| `--accent-foreground` | Texto sobre destaque | oklch(0.205 0 0) | oklch(0.985 0 0) |
| `--destructive` | Cor de erro/perigo | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) |
| `--border` | Cor de bordas | oklch(0.922 0 0) | oklch(1 0 0 / 10%) |
| `--input` | Borda de inputs | oklch(0.922 0 0) | oklch(1 0 0 / 15%) |
| `--ring` | Focus ring | oklch(0.708 0 0) | oklch(0.556 0 0) |
| `--radius` | Radius base | 0.625rem | (same) |

### Chart (manter default se Figma nao fornecer)

| CSS Variable | Descricao |
|---|---|
| `--chart-1` through `--chart-5` | Cores para graficos |

### Sidebar (manter default se Figma nao fornecer)

| CSS Variable | Descricao |
|---|---|
| `--sidebar` | Fundo do sidebar |
| `--sidebar-foreground` | Texto do sidebar |
| `--sidebar-primary` / `--sidebar-primary-foreground` | Itens ativos |
| `--sidebar-accent` / `--sidebar-accent-foreground` | Hover/destaque |
| `--sidebar-border` | Bordas do sidebar |
| `--sidebar-ring` | Focus ring do sidebar |

## Execution Steps

### Step 1: Mapear Tokens Semanticos

Para cada token Figma normalizado, encontrar a correspondencia shadcn:

```
Figma "brand/primary" → --primary
Figma "brand/primary-text" → --primary-foreground
Figma "surface/default" → --background
Figma "text/primary" → --foreground
Figma "surface/card" → --card
Figma "feedback/error" → --destructive
...
```

**Regra:** Se o Figma usar nomes diferentes, perguntar ao usuario para confirmar o mapeamento.

### Step 2: Converter para OKLch

Todos os valores de cor devem ser convertidos para formato OKLch:

- `#3B82F6` → `oklch(0.623 0.214 259.815)`
- `rgb(239, 68, 68)` → `oklch(0.577 0.245 27.325)`
- `hsl(222, 47%, 31%)` → converter para oklch

**Ferramenta:** Usar formula de conversao ou solicitar que o usuario use um conversor.

### Step 3: Identificar Extensoes

Tokens que o Figma tem mas o shadcn nao:

| Token Figma | CSS Variable Proposta | Nota |
|---|---|---|
| `feedback/warning` | `--warning` / `--warning-foreground` | Extensao |
| `feedback/info` | `--info` / `--info-foreground` | Extensao |
| `feedback/success` | `--success` / `--success-foreground` | Extensao |

Extensoes devem seguir o padrao shadcn: `--{role}` + `--{role}-foreground`.

### Step 4: Gerar Tabela de Mapeamento

Produzir tabela completa:

| Figma Token | CSS Variable | Tailwind Utility | Light Value | Dark Value |
|---|---|---|---|---|
| brand/primary | --primary | bg-primary | oklch(...) | oklch(...) |
| ... | ... | ... | ... | ... |

### Step 5: Validar Completude

- [ ] Todos os 18 core tokens mapeados
- [ ] Todos os 5 chart tokens mapeados (ou defaults mantidos)
- [ ] Todos os 8 sidebar tokens mapeados (ou defaults mantidos)
- [ ] --radius mapeado
- [ ] Extensoes documentadas
- [ ] Dark mode mapeado para cada token

## Output

- `squads/design/data/token-mapping-reference.md` — Tabela completa de mapeamento
- Dados de mapeamento para a proxima task (f1-apply-foundations)

## Conversao OKLch Reference

Para converter cores, usar a formula:

1. Converter para sRGB linear
2. Converter para CIEXYZ (D65)
3. Converter para OKLab
4. Converter para OKLch (polar form)

Formato: `oklch(L C H)` onde L=[0,1], C=[0,0.4], H=[0,360]

Para alfa: `oklch(L C H / alpha%)`

## Related Checklists

- `squads/design/checklists/token-mapping-checklist.md`
