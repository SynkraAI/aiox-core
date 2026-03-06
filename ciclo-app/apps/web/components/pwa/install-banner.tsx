'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const DISMISS_KEY = 'ciclo-pwa-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA Install Banner (AC-8)
 *
 * Listens for `beforeinstallprompt` event, shows "Adicionar a Tela Inicial"
 * banner on mobile. Can be dismissed (persisted in localStorage).
 */
export function InstallBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Do not show if already dismissed
    if (typeof window === 'undefined') return
    if (localStorage.getItem(DISMISS_KEY) === 'true') return

    const handler = (e: Event) => {
      // Prevent the default mini-infobar
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current
    if (!prompt) return

    await prompt.prompt()
    const { outcome } = await prompt.userChoice

    if (outcome === 'accepted') {
      setIsVisible(false)
    }

    deferredPromptRef.current = null
  }, [])

  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    localStorage.setItem(DISMISS_KEY, 'true')
    deferredPromptRef.current = null
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#d4c5a9] bg-[#FDF8F0] px-4 py-3 shadow-lg"
      role="banner"
      aria-label="Instalar aplicativo"
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#2d1810]">
            Adicionar a Tela Inicial
          </p>
          <p className="text-xs text-[#5c4a3a]">
            Acesse o Ciclo rapidamente e use offline
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-md px-3 py-1.5 text-xs text-[#8a7a6a] transition-colors hover:bg-[#e8dcc8]"
            aria-label="Dispensar banner de instalação"
          >
            Agora nao
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-md bg-[#8B7355] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#6d5a43]"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  )
}
