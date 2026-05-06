/**
 * ChapterColofon -- Template S-8.4 / AC-9
 *
 * Colofon editorial — single paragraph Space Grotesk uppercase tracking-editorial
 * + texture paper overlay. Ultimo elemento antes do Footer global.
 *
 * Diferente dos outros chapters: NAO e chapter-target (colofon e estatico, sem
 * motion scroll storytelling — e o punto final editorial). Server Component puro.
 *
 * Art. VII: < 100 linhas.
 */

export function ChapterColofon() {
  return (
    <footer
      className="section-bone texture-paper"
      style={{ paddingBlock: '4rem' }}
    >
      <div className="container-editorial text-center">
        <p className="font-display text-xs uppercase tracking-[var(--tracking-editorial)] text-[var(--bone-ink)] opacity-70 max-w-2xl mx-auto">
          Atelier Tocks &middot; Itajaí, SC &middot; Fundado 2008 &middot; Catálogo 2026
          &middot; Séries de 1 a 8 peças
        </p>
      </div>
    </footer>
  )
}
