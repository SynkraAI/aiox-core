import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../src/stores/auth.store'
import { useSubscription } from '../../src/hooks/useSubscription'

export default function HomeScreen() {
  const { signOut } = useAuthStore()
  const { subscription } = useSubscription()
  const isPro = subscription?.status === 'pro'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ShapeAI</Text>
        <View style={[styles.badge, isPro ? styles.badgePro : styles.badgeFree]}>
          <Text style={styles.badgeText}>{isPro ? 'Pro' : 'Free'}</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Pronto para analisar seu shape?</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(app)/camera')}>
        <Text style={styles.buttonText}>Nova Análise 📷</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondary} onPress={() => router.push('/(app)/profile')} testID="btn-configuracoes">
        <Text style={styles.secondaryText}>⚙️ Configurações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondary} onPress={signOut}>
        <Text style={styles.secondaryText}>Sair</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeFree: { backgroundColor: '#333' },
  badgePro: { backgroundColor: '#4CAF50' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 48, textAlign: 'center' },
  button: { backgroundColor: '#4CAF50', borderRadius: 16, padding: 18, width: '100%', alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  secondary: { padding: 12 },
  secondaryText: { color: '#666', fontSize: 14 },
})
