# Tech Stack - LPage Genesis Squad

## Core

| Technology   | Version | Purpose                              |
| ------------ | ------- | ------------------------------------ |
| React        | 18+     | Component rendering                  |
| TypeScript   | 5.x     | Type safety                          |
| Tailwind CSS | v4      | Utility-first styling (OKLCH colors) |
| Vite         | 6.x     | Build tool & dev server              |

## Component Library

| Library                        | Version | Purpose                  |
| ------------------------------ | ------- | ------------------------ |
| class-variance-authority (CVA) | 0.7+    | Component variants       |
| Radix UI                       | latest  | Accessible primitives    |
| tailwind-merge                 | 2.x     | Class merging            |
| Framer Motion                  | 11+     | Animations & transitions |
| lucide-react                   | latest  | Icon library             |

## Design System

| Tool                 | Purpose                        |
| -------------------- | ------------------------------ |
| Design Tokens (YAML) | W3C DTCG spec, source of truth |
| Atomic Design        | 5-level component hierarchy    |
| OKLCH Color Space    | Perceptually uniform colors    |

## MCP Integrations

| MCP Server     | Purpose                                   |
| -------------- | ----------------------------------------- |
| Netlify MCP    | Automated deploy, site management         |
| Playwright MCP | Visual QA screenshots, browser automation |

## External Tools (Free Tier)

| Tool            | Purpose                             |
| --------------- | ----------------------------------- |
| Google Stitch   | AI UI design generation (350/month) |
| Nano Banana Pro | AI image generation via Gemini 3    |
| Lighthouse CLI  | Performance auditing                |

## Deploy

| Platform | Tier | Limits                                          |
| -------- | ---- | ----------------------------------------------- |
| Netlify  | Free | 100GB bandwidth, 300 build min, unlimited sites |

## Quality

| Tool            | Purpose                          |
| --------------- | -------------------------------- |
| Lighthouse      | Performance, A11y, SEO scoring   |
| WCAG AA         | Accessibility standard (minimum) |
| Core Web Vitals | LCP <2.5s, FID <100ms, CLS <0.1  |
