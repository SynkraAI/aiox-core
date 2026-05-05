import { Stack, Redirect } from 'expo-router'
import { useAuthStore } from '../../src/stores/auth.store'

export default function AuthLayout() {
  const session = useAuthStore((s) => s.session)
  const isLoading = useAuthStore((s) => s.isLoading)

  // Quando a sessão é estabelecida (login/signup), redireciona para o app
  if (!isLoading && session) return <Redirect href="/(app)" />

  return <Stack screenOptions={{ headerShown: false }} />
}
