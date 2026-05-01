import { useState, useEffect } from 'react'
import { View, Text, Switch, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { apiGet, apiPatch } from '../../src/services/api.client'

interface Profile {
  notifications_enabled: boolean
}

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    apiGet<Profile>('/profile')
      .then((p) => setNotificationsEnabled(p.notifications_enabled ?? true))
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const handleToggle = async (value: boolean) => {
    setNotificationsEnabled(value)
    setIsSaving(true)
    try {
      await apiPatch('/profile', { notifications_enabled: value })
    } catch {
      setNotificationsEnabled(!value)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#4CAF50" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} testID="btn-voltar">
          <Text style={styles.back}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Lembretes de re-análise</Text>
            <Text style={styles.rowDesc}>Receba lembretes mensais para acompanhar seu progresso</Text>
          </View>
          <Switch
            testID="toggle-notifications"
            value={notificationsEnabled}
            onValueChange={handleToggle}
            disabled={isSaving}
            trackColor={{ false: '#333', true: '#4CAF50' }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', paddingTop: 60, paddingHorizontal: 24 },
  centered: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, gap: 16 },
  back: { color: '#4CAF50', fontSize: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#888', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222' },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { color: '#fff', fontSize: 15, fontWeight: '500', marginBottom: 4 },
  rowDesc: { color: '#666', fontSize: 13, lineHeight: 18 },
})
