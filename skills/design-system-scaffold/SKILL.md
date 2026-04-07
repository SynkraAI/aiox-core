---
name: design-system-scaffold
description: Scaffolds Next.js + Tailwind + Shadcn + Storybook 8 from extracted design tokens
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion]
version: "1.0.0"
category: design
requires: aios
---

# 🏗️ Design System Scaffold

Monta o projeto completo a partir dos tokens extraídos pelo `/design-system-forge`.

**Pré-requisito:** ter rodado `/design-system-forge` e ter a pasta `design-system/` com os dados extraídos.

---

## Quality Standard

**OBRIGATORIO:** Antes de gerar qualquer arquivo, consultar `skills/design-system-quality-standard.md`.
Checklist de entrega no final desse documento. Todo output DEVE atender os criterios la definidos.

---

## Entry Point

### Passo 1: Localizar dados extraídos

Verificar se existe `design-system/` no diretório atual ou no path informado:
- `design-system/tokens.yaml` — OBRIGATÓRIO
- `design-system/extracted-css.json` — OBRIGATÓRIO
- `design-system/components.json` — OBRIGATÓRIO
- `design-system/images/` — OBRIGATÓRIO
- `design-system/fonts/` — opcional
- `design-system/svgs/` — opcional

Se não encontrar, perguntar:
```
Não encontrei os dados extraídos. Onde está a pasta design-system/?
1. Rodar /design-system-forge primeiro (Recomendado)
2. Informar caminho (digitar path)
```

### Passo 2: Confirmar stack

```
Vou criar o projeto com essa stack:
  → Next.js 14+ (App Router)
  → Tailwind CSS 3.4+
  → Shadcn/ui (componentes base)
  → Storybook 8 (documentação visual)
  → TypeScript

A pasta do projeto é: ~/CODE/design-systems/{nome}/

Confirma?
1. Sim, prosseguir (Recomendado)
2. Mudar stack (quero outra coisa)
3. Mudar pasta
```

### Passo 3: Scaffold do projeto

Executar em sequência (mostrar progresso):

```
⏳ [1/6] Criando projeto Next.js...
⏳ [2/6] Configurando Shadcn/ui...
⏳ [3/6] Instalando Storybook 8...
⏳ [4/6] Copiando assets extraídos...
⏳ [5/6] Gerando tailwind.config.ts a partir dos tokens...
⏳ [6/6] Gerando tokens.css (CSS custom properties)...
✅ Scaffold completo!
```

**Comandos reais:**

```bash
# 1. Create Next.js (SE a pasta ainda não tem package.json)
cd {pasta} && npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias

# 2. Shadcn/ui
npx shadcn@latest init -d

# 3. Storybook 8
npx storybook@latest init --skip-install && npm install

# 4. Copy assets
cp -r design-system/images/ public/images/
cp -r design-system/svgs/ public/svgs/
cp -r design-system/fonts/ public/fonts/
cp design-system/screenshots/ public/screenshots/ 2>/dev/null

# 5. Generate tailwind config
node ~/aios-core/skills/design-system-scaffold/lib/tokens-to-tailwind.mjs \
  --input design-system/tokens.yaml \
  --css design-system/extracted-css.json \
  --output tailwind.config.ts

# 6. Generate CSS tokens
node ~/aios-core/skills/design-system-scaffold/lib/tokens-to-css.mjs \
  --input design-system/tokens.yaml \
  --output src/styles/tokens.css
```

### Passo 4: Configurar fontes

Ler `design-system/fonts/` e configurar no Next.js:

```typescript
// src/app/layout.tsx — adicionar font loading
import localFont from 'next/font/local';

const extractedFont = localFont({
  src: '../public/fonts/{font-file}',
  variable: '--font-extracted',
});
```

Se não houver fontes locais, perguntar:
```
Não encontrei fontes baixadas. O site original usa: {font-family do tokens.yaml}

1. Usar Google Fonts (Recomendado)
2. Baixar manualmente (vou te dar o link)
3. Usar font-family do sistema
```

### Passo 5: Criar estrutura de componentes

```bash
mkdir -p src/components/{atoms,molecules,organisms}
mkdir -p src/components/atoms/{button,badge,input,avatar,icon}
mkdir -p src/components/molecules/{card,nav-item,form-field}
mkdir -p src/components/organisms/{hero,header,footer,feature-section}
```

Criar `src/components/index.ts` com barrel exports.

### Passo 6: Validar

```bash
npm run build    # Zero errors
npm run storybook # Abre sem erros
```

Mostrar resultado:
```
✅ Projeto scaffoldado com sucesso!

📁 Estrutura:
  ~/CODE/design-systems/{nome}/
  ├── src/components/{atoms,molecules,organisms}/
  ├── src/styles/tokens.css
  ├── public/{images,svgs,fonts}/
  ├── tailwind.config.ts (com tokens extraídos)
  └── .storybook/ (configurado)

🎨 Tokens aplicados:
  Cores:      {N} tokens
  Tipografia: {N} variantes
  Espaçamento: {N} valores
  Animações:  {N} keyframes

Próximo passo: /design-system-storybook para gerar os componentes e stories.

Quer prosseguir?
1. Sim, gerar componentes (Recomendado)
2. Primeiro quero ver o Storybook vazio (npm run storybook)
3. Parar aqui
```

---

## Scripts CLI (lib/)

### tokens-to-tailwind.mjs
Converte `tokens.yaml` + `extracted-css.json` em `tailwind.config.ts`:
- Mapeia cores para Tailwind color palette
- Mapeia tipografia para fontFamily/fontSize
- Mapeia espaçamentos para spacing scale
- Mapeia animações/@keyframes para extend.animation + extend.keyframes
- Mapeia shadows para boxShadow
- Mapeia border-radius para borderRadius

### tokens-to-css.mjs
Converte `tokens.yaml` em CSS custom properties:
```css
:root {
  --color-primary: rgb(64, 143, 237);
  --color-secondary: rgb(62, 27, 201);
  --font-heading: 'Inter', sans-serif;
  --font-size-hero: 80px;
  --spacing-section: 120px;
  /* ... */
}
```

### scaffold-project.mjs
CLI que automatiza o scaffold completo:
```bash
node ~/aios-core/skills/design-system-scaffold/lib/scaffold-project.mjs \
  --name circle-br \
  --tokens design-system/tokens.yaml \
  --css design-system/extracted-css.json \
  --assets design-system/ \
  --output ~/CODE/design-systems/circle-br/
```

---

## Storybook Configuration

### .storybook/main.ts
```typescript
const config = {
  stories: ['../src/components/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
  ],
  framework: '@storybook/nextjs',
};
```

### .storybook/preview.ts
```typescript
import '../src/styles/tokens.css';
import '../src/app/globals.css';

const preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#000000' },
        { name: 'light', value: '#ffffff' },
      ],
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '390px', height: '844px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
      },
    },
  },
};
```
