import { Logo } from '@/components/atoms/logo'
import { Text } from '@/components/atoms/text'
import { NavLink } from '@/components/molecules/nav-link'
import { WhatsAppCTA } from '@/components/molecules/whatsapp-cta'
import { NAV_LINKS, BRAND_COPY, CONTACT_EMAIL, SITE_DESCRIPTION } from '@/lib/constants'

interface FooterProps {
  variant?: 'default' | 'minimal'
}

export function Footer({ variant = 'default' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  if (variant === 'minimal') {
    return (
      <footer className="bg-[var(--background)] border-t border-[var(--surface)]">
        <div className="container-custom py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <Text variant="caption">
            &copy; {currentYear} Tocks Custom &middot; {CONTACT_EMAIL}
          </Text>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--surface-hover)]">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <Logo className="mb-4" />
            <Text variant="caption" className="max-w-xs mb-6">
              {BRAND_COPY.footer.tagline}
            </Text>
            <Text variant="caption">{BRAND_COPY.footer.location}</Text>
          </div>

          <div>
            <span className="block font-display text-xs font-medium uppercase tracking-[0.1em] text-[var(--accent-gold)] mb-6">
              Navegacao
            </span>
            <nav className="flex flex-col gap-4" aria-label="Navegacao do rodape">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.href} href={link.href} label={link.label} />
              ))}
            </nav>
          </div>

          <div>
            <span className="block font-display text-xs font-medium uppercase tracking-[0.1em] text-[var(--accent-gold)] mb-6">
              Contato
            </span>
            <div className="flex flex-col gap-4">
              <WhatsAppCTA variant="inline" label="Fale pelo WhatsApp" />
              <Text variant="caption">{CONTACT_EMAIL}</Text>
              <Text variant="caption">Atelier em Itajai, SC</Text>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--surface-hover)] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Text variant="caption">
            &copy; {currentYear} Tocks Custom. Todos os direitos reservados.
          </Text>
          <Text variant="caption">
            {SITE_DESCRIPTION}
          </Text>
        </div>
      </div>
    </footer>
  )
}
