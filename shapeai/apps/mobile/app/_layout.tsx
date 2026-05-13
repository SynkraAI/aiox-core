import { useEffect } from 'react'
import { Linking } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthStore } from '../src/stores/auth.store'
import { configurePurchases } from '../src/services/purchases.service'
import { registerPushToken } from '../src/services/notification.service'
import { supabase } from '../src/services/supabase.client'

configurePurchases()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize)
  const session = useAuthStore((s) => s.session)

  useEffect(() => {
    initialize()
  }, [initialize])

  // Handler global de deep links OAuth — registrado antes de qualquer rota renderizar
  useEffect(() => {
    const handleUrl = async (url: string) => {
      if (!url.includes('auth-callback') && !url.includes('code=') && !url.includes('access_token')) return
      console.log('[OAuth] deep link received:', url)
      // PKCE flow: ?code=xxx (Supabase v2 padrão)
      const codeMatch = url.match(/[?&]code=([^&#]+)/)
      if (codeMatch) {
        const code = decodeURIComponent(codeMatch[1])
        console.log('[OAuth] exchanging PKCE code...')
        const { error } = await supabase.auth.exchangeCodeForSession(code).catch((e: unknown) => ({ error: e, data: null }))
        if (error) console.error('[OAuth] exchangeCodeForSession failed:', error)
        else console.log('[OAuth] session established via PKCE')
        return
      }
      // Implicit flow fallback: #access_token=xxx&refresh_token=xxx
      const fragment = url.split('#')[1]
      if (fragment) {
        const params = new URLSearchParams(fragment)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        if (accessToken && refreshToken) {
          console.log('[OAuth] setting session via implicit flow...')
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).catch((e: unknown) => console.error('[OAuth] setSession failed:', e))
        } else {
          const errorParam = params.get('error_description') || params.get('error')
          if (errorParam) console.error('[OAuth] error in redirect:', errorParam)
        }
      }
    }
    const sub = Linking.addEventListener('url', (e) => handleUrl(e.url))
    Linking.getInitialURL().then((url) => { if (url) handleUrl(url) })
    return () => sub.remove()
  }, [])

  useEffect(() => {
    if (session) registerPushToken().catch(() => {})
  }, [session])

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/(app)/camera')
    })
    return () => sub.remove()
  }, [])

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  )
}
