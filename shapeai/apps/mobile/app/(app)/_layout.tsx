import { Tabs } from 'expo-router'
import { useAuthStore } from '../../src/stores/auth.store'
import { Redirect } from 'expo-router'
import { Text } from 'react-native'

export default function AppLayout() {
  const { session } = useAuthStore()
  if (!session) return <Redirect href="/(auth)/login" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0A0A0A', borderTopColor: '#222' },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: () => <Text>🏠</Text> }}
      />
      <Tabs.Screen
        name="camera"
        options={{ title: 'Análise', tabBarIcon: () => <Text>📷</Text> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'Histórico', tabBarIcon: () => <Text>📊</Text> }}
      />
      <Tabs.Screen
        name="analysis"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="paywall"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="compare"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{ href: null }}
      />
    </Tabs>
  )
}
