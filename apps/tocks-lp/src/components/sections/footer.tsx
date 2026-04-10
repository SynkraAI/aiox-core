import Image from 'next/image'
import Icon from '@/components/ui/icon'

const SOCIAL_LINKS = [
  { name: 'Instagram', href: 'https://www.instagram.com/tockscustom/', icon: 'instagram' },
  { name: 'Facebook', href: 'https://www.facebook.com/tockscustom.com.br', icon: 'facebook' },
  { name: 'Pinterest', href: 'https://br.pinterest.com/tocksweb/', icon: 'pinterest' },
] as const

const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Tocks+Custom+Itajai+SC'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="py-10 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-start">
        {/* Brand */}
        <div>
          <Image
            src="/images/brand/tocks-logo.svg"
            alt="Tocks Custom"
            width={160}
            height={36}
            className="h-8 w-auto"
          />
          <p className="text-text-secondary text-xs mt-3">Mesas de sinuca artesanais em madeira maciça</p>
          <div className="flex gap-3 mt-4">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors"
              >
                <Icon name={link.icon} size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Location + map link */}
        <div className="text-center">
          <p className="text-text-secondary text-sm font-medium">Localização</p>
          <p className="text-text-secondary text-xs mt-2">Rua Augusto Dalago, 1743 - Itajai, SC</p>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-accent text-xs hover:underline"
          >
            Ver no Google Maps
          </a>
        </div>

        {/* Legal */}
        <div className="text-text-secondary text-xs text-center md:text-right">
          <p>&copy; {year} Tocks Custom. Todos os direitos reservados.</p>
          <p className="mt-1">CNPJ: 60.996.216/0001-80 &middot; Itajai, SC</p>
        </div>
      </div>
    </footer>
  )
}
