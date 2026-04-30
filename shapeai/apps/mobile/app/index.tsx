import { Redirect } from 'expo-router'
import { useAuthStore } from '../src/stores/auth.store'
import { View, ActivityIndicator } from 'react-native'

export default function Index() {
  const { session, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <ActivityIndicator color="#fff" />
      </View>
    )
  }

  if (!session) return <Redirect href="/(auth)/login" />
  return <Redirect href="/(app)" />
}
