---
name: image-fetcher
description: "Busca, captura e organiza assets visuais de qualquer fonte. É como um assistente de pesquisa visual: você diz o que precisa, ele vai atrás, traz e org"
  Adquire assets visuais de múltiplas fontes: busca de imagens na web,
  screenshots de sites via Playwright e arquivos fornecidos pelo usuário.
  Organiza tudo numa pasta de referência com nomes descritivos e metadados.
risk: safe
source: opensquad
paths:
  - "skills/image-fetcher/"
lazy_load: true
context_budget: 1200
mcp:
  server_name: playwright
categories: [assets, scraping, automation, images]

version: 1.0.0
category: design
tags: [SKILL]
---

# Image Fetcher

Busca, captura e organiza assets visuais de qualquer fonte. É como um assistente de pesquisa visual: você diz o que precisa, ele vai atrás, traz e organiza tudo numa pasta pronta para uso.

## When to Use This Skill

- Precisa de imagens de referência para um projeto ou squad (moodboard, benchmarks, inspiração)
- Quer screenshots de sites concorrentes, páginas de produto ou landing pages
- Precisa capturar o estado visual de uma URL específica (antes/depois, auditoria)
- Tem arquivos visuais soltos que precisam ser organizados numa pasta com nomes descritivos
- Quer baixar imagens encontradas via busca web (EXA, Google) para uso local

## Do NOT Use This Skill When

- Quer **gerar** imagens do zero (HTML → PNG) → use `image-creator`
- Quer **editar** ou **manipular** imagens existentes (crop, resize, overlay) → use `imagemagick`
- Quer criar **arte original** ou ilustrações → use ferramentas de geração de imagem
- O design já existe no Figma ou Canva → use a skill correspondente

## Discovery Questions

Perguntas para fazer antes de executar. Use a tool AskUserQuestion. Pule se o usuário já forneceu o contexto.

1. **Que tipo de imagem você precisa?** — (screenshot de site, imagem de referência via busca, ou organizar arquivos que você já tem?)
2. **Tem URLs específicas para capturar?** — (se for screenshot, preciso das URLs; se for busca, palavras-chave bastam)
3. **Qual resolução/dimensão desejada?** — (1080x1080 para Instagram, 1280x720 genérico, full-page para landing pages)
4. **Qual formato de saída?** — (PNG para qualidade máxima, JPEG para tamanho menor, WebP para web)
5. **Onde salvar os arquivos?** — (pasta do squad: `squads/{nome}/reference/`, ou caminho customizado)

## Prerequisites

| Requisito | Quando é necessário | Como verificar |
|-----------|---------------------|----------------|
| Playwright MCP | Screenshots de sites | MCP `playwright` configurado em `.mcp.json` |
| Acesso web (EXA/search) | Busca de imagens na web | Tool `web_search` ou MCP `exa` disponível |
| Nenhum | Organização de arquivos do usuário | Basta os arquivos existirem no disco |

## Sources (Modos de Aquisição)

### 1. Web Search (Busca de Imagens)

Usa `web_search` ou EXA MCP para encontrar imagens por palavras-chave. Ideal para referências visuais, benchmarks e inspiração.

**Fluxo:**
1. Buscar por palavras-chave relevantes (ex: "dashboard design fintech dark mode")
2. Avaliar resultados — priorizar imagens de alta resolução e fontes confiáveis
3. Baixar as melhores correspondências para a pasta de destino
4. Nomear com slug descritivo: `fintech-dashboard-dark-reference.png`

**Dicas:**
- Adicione termos de qualidade à busca: "high resolution", "UI design", "screenshot"
- Prefira fontes como Dribbble, Behance, Awwwards para design
- Evite imagens com marca d'água visível

### 2. Screenshot (Captura de Sites via Playwright)

Usa Playwright MCP para navegar até uma URL e capturar o estado visual. Como tirar uma foto da tela — mas com controle total de resolução e viewport.

**Modos de captura:**

| Modo | Quando usar | Detalhes |
|------|-------------|----------|
| `viewport` | Captura do que está visível (padrão) | Rápido, ideal para above-the-fold |
| `full_page` | Página inteira com scroll | Landing pages, artigos longos |
| `selector` | Elemento CSS específico | Um card, um header, uma seção |

**Fluxo:**
1. Navegar até a URL com `browser_navigate`
2. Configurar viewport com `browser_resize` (dimensões da plataforma alvo)
3. Aguardar carregamento completo (`browser_wait_for` se necessário)
4. Capturar com `browser_take_screenshot`
5. Salvar na pasta de destino com nome descritivo

**Viewport Presets:**

| Plataforma | Dimensões |
|------------|-----------|
| Instagram Post | 1080 x 1080 |
| Instagram Carousel | 1080 x 1440 |
| Instagram Story/Reel | 1080 x 1920 |
| Facebook Post | 1200 x 630 |
| Twitter/X Post | 1200 x 675 |
| LinkedIn Post | 1200 x 627 |
| YouTube Thumbnail | 1280 x 720 |
| Desktop Full | 1440 x 900 |
| Mobile (iPhone) | 390 x 844 |

### 3. User Files (Arquivos Fornecidos pelo Usuário)

Organiza arquivos que o usuário já tem no disco. Renomeia, move para a pasta correta e cataloga com metadados.

**Fluxo:**
1. Usuário indica os arquivos ou pasta de origem
2. Verificar formatos (PNG, JPEG, WebP, SVG)
3. Renomear com nomes descritivos (slug do conteúdo, não `image1.png`)
4. Mover para a pasta de destino organizada
5. Documentar metadados de cada arquivo

## Phases (Execução)

### Phase 1 — Entender a Necessidade

- Rodar Discovery Questions (se contexto insuficiente)
- Identificar qual(is) source(s) usar: web search, screenshot, user files
- Definir pasta de destino e convenção de nomes
- Verificar se assets já existem na pasta (cache check)

### Phase 2 — Buscar e Capturar

- Executar aquisição conforme o(s) modo(s) identificado(s)
- Para screenshots: respeitar viewport e aguardar carregamento
- Para busca web: avaliar qualidade antes de baixar
- Para user files: validar que os arquivos existem e são imagens válidas
- Timeout máximo de 30 segundos por screenshot — pular e avisar se exceder

### Phase 3 — Organizar na Pasta

- Salvar todos os assets na pasta de destino com nomes descritivos
- Padrão de nomes: `{contexto}-{descricao}-{tipo}.{ext}`
  - Ex: `competitor-nubank-homepage.png`
  - Ex: `reference-dark-dashboard-fintech.jpg`
  - Ex: `screenshot-stripe-pricing-fullpage.png`
- Não usar nomes genéricos (`image1.png`, `screenshot.png`, `download.jpg`)

### Phase 4 — Validar e Documentar

- Verificar que todos os arquivos foram salvos corretamente
- Para screenshots: ler a imagem capturada para confirmar qualidade visual
- Documentar metadados de cada asset adquirido:

```yaml
- path: squads/brandcraft/reference/competitor-nubank-homepage.png
  width: 1440
  height: 900
  source_type: screenshot  # screenshot | web_search | user_provided
  original_url: https://nubank.com.br
  captured_at: 2026-03-24
```

## Output Format

Pasta organizada com assets nomeados e um resumo dos arquivos adquiridos:

```
squads/{squad}/reference/
├── competitor-nubank-homepage.png
├── competitor-stripe-pricing-fullpage.png
├── reference-dark-dashboard-fintech.jpg
└── reference-card-layout-modern.png
```

O agente deve apresentar ao usuário:
1. Lista dos assets adquiridos com path e dimensões
2. Fonte de cada asset (URL, busca, ou arquivo do usuário)
3. Qualquer problema encontrado (URL inacessível, imagem de baixa qualidade, timeout)

## Safety Rules

| Regra | Detalhe |
|-------|---------|
| Timeout | Máximo 30s por screenshot — pular e avisar se exceder |
| Dimensão máxima | 1920 x 1920px para screenshots |
| URLs bloqueadas | `file://`, `localhost`, IPs privados (127.0.0.1, 10.x, 192.168.x) |
| Cache | Verificar se o asset já existe antes de buscar novamente |
| Normalização | Remover parâmetros de tracking das URLs antes de cachear |

## Best Practices

- **Screenshots > busca web** para páginas de produto/tool — imagens de busca costumam estar desatualizadas
- **Nomes descritivos sempre** — o nome do arquivo deve dizer o que é sem precisar abrir
- **Verificar qualidade** — ler o screenshot capturado para confirmar que a página carregou corretamente
- **Não duplicar** — se o asset já existe na pasta, reutilizar em vez de baixar de novo
- **Documentar tudo** — cada asset com source, dimensões e data de captura para rastreabilidade
