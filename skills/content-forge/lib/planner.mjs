/**
 * Content Forge — Plan Generator
 *
 * Builds an execution plan from classified demand + capability map.
 * Output is a structured plan object that can be rendered as text.
 */

import { findBest, findAlternatives } from '../../packages/capability-map/index.mjs';

/**
 * Build an execution plan for a content production demand.
 *
 * @param {object} params
 * @param {object} params.classification - From classifier.mjs
 * @param {object} params.brand - Loaded brand object from brand-schema
 * @param {string[]} params.capabilities - Required capability keys
 * @param {object} [params.options] - User preferences (reelType, platform, etc.)
 * @returns {object} Structured plan
 */
function buildPlan(params) {
  const { classification, brand, capabilities, options = {} } = params;
  const steps = [];
  const decisions = [];
  let stepNum = 1;

  for (const cap of capabilities) {
    const best = findBest(cap);
    if (!best) continue;

    const alts = findAlternatives(cap);
    const step = {
      number: stepNum++,
      title: capabilityTitle(cap),
      executor: best.best,
      agent: best.agent,
      why: best.why,
      input: buildInput(cap, classification, brand),
      output: buildOutput(cap),
      checkpoint: isCheckpointCapability(cap),
    };

    // If quality mode and alternatives with debate exist, present choice
    if (classification.urgency === 'quality' && alts.length > 0) {
      const debateAlt = alts.find((a) => a.when?.includes('debate'));
      if (debateAlt) {
        decisions.push({
          step: step.number,
          question: `Usar ${best.best} (rápido) ou ${debateAlt.source} (com debate de qualidade)?`,
          options: [
            { label: 'A', value: best.best, description: 'Produção direta' },
            { label: 'B', value: debateAlt.source, description: debateAlt.when },
          ],
        });
      }
    }

    // Special: reel type decision
    if (cap === 'reels_script' && !options.reelType) {
      decisions.push({
        step: step.number + 1,
        question: 'Qual tipo de reel?',
        options: [
          { label: 'A', value: 'viral-squad', description: 'Tipografia animada (Remotion kinetic text)' },
          { label: 'B', value: 'ai-reels', description: 'Talking head com avatar (ElevenLabs + HeyGen)' },
          { label: 'C', value: 'audio-reels', description: 'Animação a partir de áudio (Kling AI)' },
        ],
      });
    }

    steps.push(step);
  }

  return {
    brand: {
      name: brand.meta.name,
      theme: brand.meta.theme,
      primary: brand.colors?.semantic?.primary,
      fonts: `${brand.typography?.family?.display} / ${brand.typography?.family?.body}`,
    },
    classification,
    steps,
    decisions,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Render a plan as human-readable text for plan mode.
 * @param {object} plan - From buildPlan()
 * @returns {string} Formatted plan text
 */
function renderPlan(plan) {
  const lines = [];

  lines.push(`# PLANO DE PRODUÇÃO — Marca: ${plan.brand.name}`);
  lines.push(`Theme: ${plan.brand.theme} | Primary: ${plan.brand.primary} | Fonts: ${plan.brand.fonts}`);
  lines.push('');

  for (const step of plan.steps) {
    lines.push(`## Etapa ${step.number}: ${step.title}`);
    lines.push(`  Executor: ${step.executor}${step.agent ? ` → ${step.agent}` : ''}`);
    lines.push(`  Motivo: ${step.why}`);
    lines.push(`  Input: ${step.input}`);
    lines.push(`  Output: ${step.output}`);

    if (step.checkpoint) {
      lines.push(`  ⏸ CHECKPOINT: revisar antes de prosseguir`);
    }
    lines.push('');
  }

  if (plan.decisions.length > 0) {
    lines.push('## Decisões Pendentes');
    for (const d of plan.decisions) {
      lines.push(`  Etapa ${d.step}: ${d.question}`);
      for (const opt of d.options) {
        lines.push(`    [${opt.label}] ${opt.value} — ${opt.description}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ── Helpers ──────────────────────────────────────────

function capabilityTitle(cap) {
  const MAP = {
    carousel_copy: 'Copy dos Carrosséis',
    carousel_render: 'Render Visual dos Carrosséis',
    reels_script: 'Roteiro dos Reels',
    stories_script: 'Script dos Stories',
    content_calendar: 'Planejamento Editorial',
    content_repurposing: 'Multiplicação de Conteúdo',
    competitor_research: 'Pesquisa de Concorrentes',
    hook_generation: 'Geração de Hooks',
    brand_strategy: 'Estratégia de Marca',
    video_branded: 'Produção de Vídeo',
    landing_page: 'Geração de Landing Page',
    ds_extraction: 'Extração de Design System',
    ds_scaffold: 'Scaffold de Design System',
    publish_ig_carousel: 'Publicação Instagram',
    publish_multi_platform: 'Publicação Multi-plataforma',
    publish_reel: 'Publicação de Reel',
    image_render: 'Render de Imagens',
    image_acquisition: 'Aquisição de Imagens',
  };
  return MAP[cap] || cap.replace(/_/g, ' ');
}

function buildInput(cap, classification, brand) {
  const theme = `tema "${classification.raw.substring(0, 60)}", brand ${brand.meta.name}`;
  return theme;
}

function buildOutput(cap) {
  const MAP = {
    carousel_copy: 'Scripts de carrossel com slides + copy + CTAs',
    carousel_render: 'PNGs 1080x1350 branded',
    reels_script: 'Roteiros de reel com hooks + beats + CTA',
    stories_script: 'Sequências de stories com intenção de conversão',
    content_calendar: 'Calendário editorial com peças distribuídas',
    content_repurposing: 'Micro-peças em múltiplos formatos',
    video_branded: 'MP4/GIF branded com motion presets',
    landing_page: 'HTML ou Next.js com brand tokens aplicados',
    publish_ig_carousel: 'Posts publicados no Instagram',
    publish_reel: 'Reel publicado via Blotato',
    publish_multi_platform: 'Posts publicados em múltiplas plataformas',
  };
  return MAP[cap] || 'Output processado';
}

function isCheckpointCapability(cap) {
  return ['carousel_copy', 'reels_script', 'stories_script', 'content_calendar'].includes(cap);
}

export { buildPlan, renderPlan };
