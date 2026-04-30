import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../src/stores/auth.store'

export default function HomeScreen() {
  const { signOut } = useAuthStore()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShapeAI</Text>
      <Text style={styles.subtitle}>Pronto para analisar seu shape?</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/(app)/camera')}>
        <Text style={styles.buttonText}>Nova Análise 📷</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondary} onPress={signOut}>
        <Text style={styles.secondaryText}>Sair</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 48, textAlign: 'center' },
  button: { backgroundColor: '#4CAF50', borderRadius: 16, padding: 18, width: '100%', alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  secondary: { padding: 12 },
  secondaryText: { color: '#666', fontSize: 14 },
})
