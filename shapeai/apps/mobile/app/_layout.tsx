import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthStore } from '../src/stores/auth.store'
import { configurePurchases } from '../src/services/purchases.service'
import { registerPushToken } from '../src/services/notification.service'

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
