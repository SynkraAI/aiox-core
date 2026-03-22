/**
 * Next.js project scaffolder for Landing Pages.
 * Creates a complete Next.js 15 + TypeScript + Tailwind + Framer Motion project
 * with LP-specific components (Hero, Problem, Solution, Proof, Offer, CTA, FAQ).
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { brandToShadcnVars } from '../../md-to-branded-pdf/lib/color-mapper.mjs';
import {
  getLayout,
  getProviders,
  getGlobalCSS,
  getAnimatedCounter,
  getTailwindConfig,
  getNextConfig,
  getTsConfig,
  getPostcssConfig,
  getUtils,
} from '../../md-to-branded-pdf/lib/nextjs-templates.mjs';
import {
  getLPPage,
  getLPNavComponent,
  getLPHeroComponent,
  getLPProblemComponent,
  getLPSolutionComponent,
  getLPProofComponent,
  getLPOfferComponent,
  getLPCTAComponent,
  getLPFAQComponent,
  getLPFooterComponent,
  getLPStickyCTAComponent,
} from './lp-nextjs-templates.mjs';

/**
 * Generate a complete Next.js Landing Page project.
 * @param {object} parsed - Parsed LP markdown structure
 * @param {object} brand - Brand config
 * @param {object} effectsConfig - LP effects configuration
 * @param {string} outputPath - Root directory for the project
 * @returns {string} Output path
 */
export function generateLPNextJSProject(parsed, brand, effectsConfig, outputPath) {
  console.log(`\n📦 Generating Landing Page Next.js project at ${outputPath}...\n`);

  // Create directory structure
  const dirs = ['app', 'components', 'components/ui', 'lib'];
  dirs.forEach(dir => mkdirSync(join(outputPath, dir), { recursive: true }));

  // Generate shadcn CSS vars
  const shadcnVars = brandToShadcnVars(brand, 'dark');

  // Root configs
  writeRootConfigs(outputPath, brand);

  // App files
  writeFileSync(join(outputPath, 'app', 'layout.tsx'), getLayout(brand));
  writeFileSync(join(outputPath, 'app', 'providers.tsx'), getProviders(brand));
  writeFileSync(join(outputPath, 'app', 'globals.css'), getGlobalCSS(shadcnVars));
  writeFileSync(join(outputPath, 'app', 'page.tsx'), getLPPage(parsed, brand, effectsConfig));

  // LP components
  const compsDir = join(outputPath, 'components');
  writeFileSync(join(compsDir, 'lp-nav.tsx'), getLPNavComponent());
  writeFileSync(join(compsDir, 'lp-hero.tsx'), getLPHeroComponent(effectsConfig));
  writeFileSync(join(compsDir, 'lp-problem.tsx'), getLPProblemComponent(effectsConfig));
  writeFileSync(join(compsDir, 'lp-solution.tsx'), getLPSolutionComponent(effectsConfig));
  writeFileSync(join(compsDir, 'lp-proof.tsx'), getLPProofComponent(effectsConfig));
  writeFileSync(join(compsDir, 'lp-offer.tsx'), getLPOfferComponent(effectsConfig));
  writeFileSync(join(compsDir, 'lp-cta.tsx'), getLPCTAComponent());
  writeFileSync(join(compsDir, 'lp-faq.tsx'), getLPFAQComponent());
  writeFileSync(join(compsDir, 'lp-footer.tsx'), getLPFooterComponent());

  if (effectsConfig.stickyCTA) {
    writeFileSync(join(compsDir, 'lp-sticky-cta.tsx'), getLPStickyCTAComponent());
  }

  if (effectsConfig.animatedCounters) {
    const counterContent = getAnimatedCounter(effectsConfig);
    if (counterContent) {
      writeFileSync(join(compsDir, 'animated-counter.tsx'), counterContent);
    }
  }

  // Lib
  writeFileSync(join(outputPath, 'lib', 'utils.ts'), getUtils());

  console.log('\n✅ Landing Page Next.js project generated!\n');
  console.log('📋 Next steps:');
  console.log('   1. cd', outputPath);
  console.log('   2. npm install');
  console.log('   3. npm run dev');
  console.log('   4. Open http://localhost:3000\n');

  return outputPath;
}

/**
 * Write root-level config files.
 */
function writeRootConfigs(root, brand) {
  const packageJson = {
    name: 'landing-page',
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies: {
      next: '^15.0.0',
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      'framer-motion': '^11.0.0',
      'next-themes': '^0.4.0',
      'class-variance-authority': '^0.7.0',
      'tailwind-merge': '^2.5.0',
      clsx: '^2.1.0',
    },
    devDependencies: {
      tailwindcss: '^3.4.0',
      postcss: '^8.4.0',
      autoprefixer: '^10.4.0',
      typescript: '^5.5.0',
      '@types/react': '^19.0.0',
      '@types/node': '^22.0.0',
      '@types/react-dom': '^19.0.0',
    },
  };

  writeFileSync(join(root, 'package.json'), JSON.stringify(packageJson, null, 2));
  writeFileSync(join(root, 'next.config.mjs'), getNextConfig());
  writeFileSync(join(root, 'tsconfig.json'), getTsConfig());
  writeFileSync(join(root, 'tailwind.config.ts'), getTailwindConfig(brand));
  writeFileSync(join(root, 'postcss.config.mjs'), getPostcssConfig());

  const gitignore = `/node_modules\n/.next/\n/out/\n/build\n.DS_Store\n*.pem\nnpm-debug.log*\n.env*.local\n.vercel\n*.tsbuildinfo\nnext-env.d.ts\n`;
  writeFileSync(join(root, '.gitignore'), gitignore);
}
