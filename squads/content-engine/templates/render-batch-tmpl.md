# Template: JSON Batch para render.ts

## Metadata
- id: render-batch-tmpl
- version: 1.0.0
- tipo: template de integração
- renderizador: `docs/instagram/render.ts`

## Propósito

Documentar o formato JSON batch compatível com `render.ts` para que a Fase 4 do Weekly Sprint gere automaticamente os arquivos de render.

---

## Contrato JSON

O `render.ts` aceita dois modos:

### Modo single
```bash
npx tsx docs/instagram/render.ts --template <nome> --data '{"KEY":"val"}' --out <path.png>
```

### Modo batch
```bash
npx tsx docs/instagram/render.ts --batch batch.json
```

O batch JSON é um array de objetos `RenderJob`:

```typescript
interface RenderJob {
  template: string;       // nome do template (sem .html)
  data: Record<string, string>;  // variáveis para substituir
  out: string;            // caminho relativo do output PNG
}
```

---

## Templates Disponíveis

### 1. `cover` — Capa de carrossel / 1o slide
- **Dimensões**: 1080x1350
- **Fundo padrão**: Navy (#14213D)
- **Variáveis**:

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `BG_COLOR` | sim | Cor de fundo (hex) | `#14213D` |
| `TEXT_COLOR` | sim | Cor do headline (hex) | `#FFFFFF` |
| `BODY_COLOR` | sim | Cor do body text (hex) | `rgba(255,255,255,0.7)` |
| `HEADLINE` | sim | Texto do headline (max 8 palavras). Usar `<span class="highlight">` para accent gold | `A <span class="highlight">clareza</span> que falta` |
| `BODY` | não | Texto do body (max 25 palavras) | `Slide para descobrir` |

### 2. `content-basic` — Slides internos com badge/número
- **Dimensões**: 1080x1350
- **Fundo padrão**: Alternante (ímpar=branco, par=escuro)
- **Variáveis**:

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `BG_COLOR` | sim | Cor de fundo | `#FFFFFF` ou `#14213D` |
| `TEXT_COLOR` | sim | Cor do headline | `#14213D` ou `#FFFFFF` |
| `BODY_COLOR` | sim | Cor do body | `#333333` ou `rgba(255,255,255,0.7)` |
| `MUTED_COLOR` | sim | Cor de elementos secundários (seta) | `#999999` ou `rgba(255,255,255,0.3)` |
| `BADGE_NUM` | sim | Número do badge (slide) | `1` |
| `BADGE_LABEL` | não | Label do badge | `PASSO 1` |
| `HEADLINE` | sim | Headline do slide | `Pare de consumir conteúdo` |
| `BODY` | não | Body text | `A maioria consome mais do que aplica.` |
| `ARROW` | não | HTML da seta de navegação | `<div class="arrow">\u2192</div>` |

### 3. `content-list` — Slides com lista de itens
- **Dimensões**: 1080x1350
- **Fundo padrão**: Alternante
- **Variáveis**: Mesmas do `content-basic` mais:

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `LIST_ITEMS` | sim | HTML de itens `<li>` | `<li>Item 1</li><li>Item 2</li>` |

### 4. `static-post` — Frase-tese, opinião, reflexão
- **Dimensões**: 1080x1350
- **Fundo padrão**: Navy ou White
- **Variáveis**:

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `BG_COLOR` | sim | Cor de fundo | `#14213D` |
| `TEXT_COLOR` | sim | Cor do headline (116px!) | `#FFFFFF` |
| `BODY_COLOR` | sim | Cor do body | `rgba(255,255,255,0.7)` |
| `MUTED_COLOR` | sim | Cor do autor | `rgba(255,255,255,0.4)` |
| `HEADLINE` | sim | Frase-tese forte (max 8 palavras, 116px) | `Clareza vem antes de disciplina` |
| `BODY` | não | Complemento (max 25 palavras) | `` |
| `AUTHOR` | não | Nome/handle do autor | `@tiagoalmeidaoficial` |

### 5. `story-frame` — Frames de story sequence
- **Dimensões**: 1080x1920 (9:16)
- **Fundo padrão**: Alternante
- **Variáveis**:

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `BG_COLOR` | sim | Cor de fundo | `#14213D` |
| `TEXT_COLOR` | sim | Cor do headline | `#FFFFFF` |
| `BODY_COLOR` | sim | Cor do body | `rgba(255,255,255,0.7)` |
| `MUTED_COLOR` | sim | Cor de elementos secundários | `rgba(255,255,255,0.3)` |
| `HEADLINE` | sim | Headline do story | `Por que você está travado?` |
| `BODY` | não | Body text | `Não é falta de informação.` |
| `CTA` | não | Call to action (gold, 28px) | `DESLIZE PARA CIMA` |
| `COUNTER` | não | Indicador de posição | `1/5` |

---

## Valores do Design System (hardcoded)

Referência: `docs/design-system.md` seção 10

### Paleta de Fundos

| Contexto | `BG_COLOR` | `TEXT_COLOR` | `BODY_COLOR` | `MUTED_COLOR` |
|----------|-----------|-------------|-------------|---------------|
| Navy (impacto) | `#14213D` | `#FFFFFF` | `rgba(255,255,255,0.7)` | `rgba(255,255,255,0.3)` |
| Branco (didático) | `#FFFFFF` | `#14213D` | `#333333` | `#999999` |
| Gold (milestone) | `#FCA311` | `#14213D` | `#333333` | `rgba(20,33,61,0.4)` |
| Cinza claro (reflexivo) | `#F5F5F5` | `#14213D` | `#333333` | `#999999` |
| Cinza escuro (confessional) | `#2D2D2D` | `#FFFFFF` | `rgba(255,255,255,0.7)` | `rgba(255,255,255,0.3)` |

### Accent Gold
- Cor: `#C9A84C` (usado em badges, highlights, dividers)
- Para highlight no headline: `<span class="highlight">palavra</span>`
- Regra: max 1 palavra/frase por slide com accent gold

### Seta de navegação
```html
<div class="arrow">→</div>
```

### Regras de alternância
- Slides ímpares (1, 3, 5...): fundo claro (Branco ou Cinza claro)
- Slides pares (2, 4, 6...): fundo escuro (Navy ou Cinza escuro)
- Capa: SEMPRE Navy
- Último slide (CTA): SEMPRE Navy

---

## Exemplo: Carrossel Completo (7 slides)

```json
[
  {
    "template": "cover",
    "data": {
      "BG_COLOR": "#14213D",
      "TEXT_COLOR": "#FFFFFF",
      "BODY_COLOR": "rgba(255,255,255,0.7)",
      "HEADLINE": "3 sinais de que você está <span class=\"highlight\">travado</span>",
      "BODY": "Deslize para descobrir →"
    },
    "out": "semana-5/carousel-1/01-cover.png"
  },
  {
    "template": "content-basic",
    "data": {
      "BG_COLOR": "#FFFFFF",
      "TEXT_COLOR": "#14213D",
      "BODY_COLOR": "#333333",
      "MUTED_COLOR": "#999999",
      "BADGE_NUM": "1",
      "BADGE_LABEL": "SINAL",
      "HEADLINE": "Você consome mais do que aplica",
      "BODY": "Cursos, podcasts, livros. Mas nada muda na prática.",
      "ARROW": "<div class=\"arrow\">→</div>"
    },
    "out": "semana-5/carousel-1/02-sinal-1.png"
  },
  {
    "template": "content-basic",
    "data": {
      "BG_COLOR": "#14213D",
      "TEXT_COLOR": "#FFFFFF",
      "BODY_COLOR": "rgba(255,255,255,0.7)",
      "MUTED_COLOR": "rgba(255,255,255,0.3)",
      "BADGE_NUM": "2",
      "BADGE_LABEL": "SINAL",
      "HEADLINE": "Tudo parece urgente",
      "BODY": "Se tudo é prioridade, nada é prioridade.",
      "ARROW": "<div class=\"arrow\">→</div>"
    },
    "out": "semana-5/carousel-1/03-sinal-2.png"
  },
  {
    "template": "content-basic",
    "data": {
      "BG_COLOR": "#FFFFFF",
      "TEXT_COLOR": "#14213D",
      "BODY_COLOR": "#333333",
      "MUTED_COLOR": "#999999",
      "BADGE_NUM": "3",
      "BADGE_LABEL": "SINAL",
      "HEADLINE": "Você planeja mais do que executa",
      "BODY": "Lista de tarefas que cresce. Resultados que não aparecem.",
      "ARROW": "<div class=\"arrow\">→</div>"
    },
    "out": "semana-5/carousel-1/04-sinal-3.png"
  },
  {
    "template": "content-basic",
    "data": {
      "BG_COLOR": "#14213D",
      "TEXT_COLOR": "#FFFFFF",
      "BODY_COLOR": "rgba(255,255,255,0.7)",
      "MUTED_COLOR": "rgba(255,255,255,0.3)",
      "BADGE_NUM": "",
      "BADGE_LABEL": "A RAIZ",
      "HEADLINE": "O problema não é <span class=\"highlight\">produtividade</span>",
      "BODY": "É falta de direção. Você está ocupado, não produtivo.",
      "ARROW": "<div class=\"arrow\">→</div>"
    },
    "out": "semana-5/carousel-1/05-raiz.png"
  },
  {
    "template": "content-basic",
    "data": {
      "BG_COLOR": "#FFFFFF",
      "TEXT_COLOR": "#14213D",
      "BODY_COLOR": "#333333",
      "MUTED_COLOR": "#999999",
      "BADGE_NUM": "",
      "BADGE_LABEL": "A SAÍDA",
      "HEADLINE": "Clareza antes de ação",
      "BODY": "1 hora de clareza economiza 10 de retrabalho.",
      "ARROW": "<div class=\"arrow\">→</div>"
    },
    "out": "semana-5/carousel-1/06-saida.png"
  },
  {
    "template": "content-basic",
    "data": {
      "BG_COLOR": "#14213D",
      "TEXT_COLOR": "#FFFFFF",
      "BODY_COLOR": "rgba(255,255,255,0.7)",
      "MUTED_COLOR": "rgba(255,255,255,0.3)",
      "BADGE_NUM": "",
      "BADGE_LABEL": "NEXT STEP",
      "HEADLINE": "Quer sair do caos?",
      "BODY": "Link na bio — sessão gratuita de clareza e direção.",
      "ARROW": ""
    },
    "out": "semana-5/carousel-1/07-cta.png"
  }
]
```

## Exemplo: Post Estático

```json
[
  {
    "template": "static-post",
    "data": {
      "BG_COLOR": "#14213D",
      "TEXT_COLOR": "#FFFFFF",
      "BODY_COLOR": "rgba(255,255,255,0.7)",
      "MUTED_COLOR": "rgba(255,255,255,0.4)",
      "HEADLINE": "Clareza vem antes de <span class=\"highlight\">disciplina</span>",
      "BODY": "",
      "AUTHOR": "@tiagoalmeidaoficial"
    },
    "out": "semana-5/static-1/01-frase-tese.png"
  }
]
```

---

## Convenções de Output

### Estrutura de pastas
```
output/
└── semana-N/
    ├── carousel-1/
    │   ├── 01-cover.png
    │   ├── 02-slide-1.png
    │   └── ...
    ├── carousel-2/
    ├── static-1/
    ├── reel-1/
    └── story-1/
```

### Nomenclatura de arquivos
- Prefixo numérico com zero-padding: `01-`, `02-`, ...
- Slug descritivo: `cover`, `slide-1`, `cta`, `frase-tese`
- Extensão: sempre `.png`

---

## Comandos de Render

```bash
# Render batch completo da semana
bun docs/instagram/render.ts --batch output/batch-semana-N.json

# Render single para teste
bun docs/instagram/render.ts --template static-post --data '{"BG_COLOR":"#14213D","TEXT_COLOR":"#FFF","BODY_COLOR":"rgba(255,255,255,0.7)","MUTED_COLOR":"rgba(255,255,255,0.4)","HEADLINE":"Teste","AUTHOR":"@tiago"}' --out test.png
```

Templates em `docs/instagram/templates/`, fontes em `docs/instagram/fonts/`, output em `docs/instagram/output/`.
