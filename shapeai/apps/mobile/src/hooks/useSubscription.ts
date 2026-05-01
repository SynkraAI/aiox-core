import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '../services/api.client'

export interface SubscriptionStatus {
  status: 'free' | 'pro'
  expires_at: string | null
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(() => {
    apiGet<SubscriptionStatus>('/subscription/status')
      .then(setSubscription)
      .catch(() => setSubscription({ status: 'free', expires_at: null }))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Polling pós-compra: verifica a cada 2s até status pro ou esgotamento (10s)
  const pollUntilPro = useCallback(
    (options = { intervalMs: 2000, maxAttempts: 5 }): Promise<void> =>
      new Promise((resolve) => {
        let attempts = 0
        const interval = setInterval(async () => {
          attempts++
          try {
            const status = await apiGet<SubscriptionStatus>('/subscription/status')
            setSubscription(status)
            if (status.status === 'pro' || attempts >= options.maxAttempts) {
              clearInterval(interval)
              resolve()
            }
          } catch {
            if (attempts >= options.maxAttempts) {
              clearInterval(interval)
              resolve()
            }
          }
        }, options.intervalMs)
      }),
    []
  )

  return { subscription, isLoading, pollUntilPro }
}
