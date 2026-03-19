# AI Reels Squad

Media production squad for automated video generation using Remotion. Creates AI-powered short-form video content (reels, shorts, TikToks).

## Structure

- **Remotion:** Video rendering engine and templates
- **Node Modules:** Complete Remotion/React/TypeScript stack
- **Assets:** Video components, compositions, and media files

## Key Capabilities

- Programmatic video generation with React components
- Template-based reel creation
- Automated video rendering
- Dynamic content composition
- Export to various formats (MP4, GIF, etc.)

## Tech Stack

- **Remotion:** Video generation framework
- **React:** Component-based video compositions
- **TypeScript:** Type-safe video scripts
- **Webpack/ESBuild:** Bundle and render optimization

## Use Cases

- Batch video generation from templates
- Automated social media content
- Dynamic video personalization
- Programmatic video editing

## Activation

`/ai-reels:README` or load from `squads/ai-reels/`

## Notes

This squad is a media production environment, not a traditional agent squad. Requires Node.js and Remotion dependencies installed.

**agents/**: Vazio por design. A orquestração acontece via componentes React e scripts de rendering, não via agentes markdown. Se no futuro o squad evoluir para incluir agentes (ex: diretor criativo, editor de cortes), eles serão definidos ali.

**tasks/**: Vazio por design. As "tasks" são scripts de rendering e composições React, não arquivos markdown. Se no futuro o squad adotar tasks estruturadas (ex: render-batch, generate-template), elas serão definidas ali.
