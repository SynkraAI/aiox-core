import { useState, useEffect } from 'react'
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../src/stores/auth.store'
import { useSubscription } from '../../src/hooks/useSubscription'
import { getUserProfile, updateUserProfile } from '../../src/services/profile.service'
import type { UserProfile } from '@shapeai/shared'

const GOAL_LABEL: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  fat_loss: 'Emagrecimento',
  conditioning: 'Condicionamento',
}

const PERSONAS: Array<{
  id: 'rafael' | 'marina' | 'bruno'
  name: string
  tagline: string
  example: string
}> = [
  {
    id: 'rafael',
    name: 'Rafael',
    tagline: 'Dados, progressão e resultado',
    example: '"Excelente dado — progressão consistente."',
  },
  {
    id: 'marina',
    name: 'Marina',
    tagline: 'Seu ritmo, sua evolução',
    example: '"Você conseguiu! Isso é resultado do seu esforço."',
  },
  {
    id: 'bruno',
    name: 'Bruno',
    tagline: 'Sem desculpas, só resultados',
    example: '"Isso é o mínimo. Agora suba o nível."',
  },
]

export default function ProfileScreen() {
  const { signOut } = useAuthStore()
  const { subscription } = useSubscription()
  const isPro = subscription?.status === 'pro'

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [selectedPersona, setSelectedPersona] = useState<'rafael' | 'marina' | 'bruno'>('rafael')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingPersona, setIsSavingPersona] = useState(false)

  useEffect(() => {
    getUserProfile()
      .then((p) => {
        setProfile(p)
        setNotificationsEnabled((p as UserProfile & { notifications_enabled?: boolean }).notifications_enabled ?? true)
        setSelectedPersona(p.coach_persona ?? 'rafael')
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  const handleToggle = async (value: boolean) => {
    setNotificationsEnabled(value)
    setIsSaving(true)
    try {
      await updateUserProfile({ notifications_enabled: value })
    } catch {
      setNotificationsEnabled(!value)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectPersona = async (persona: 'rafael' | 'marina' | 'bruno') => {
    if (persona === selectedPersona || isSavingPersona) return
    const prev = selectedPersona
    setSelectedPersona(persona)
    setIsSavingPersona(true)
    try {
      await updateUserProfile({ coach_persona: persona })
    } catch {
      setSelectedPersona(prev)
    } finally {
      setIsSavingPersona(false)
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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Perfil</Text>

      {/* Plano atual */}
      <View style={styles.planCard}>
        <View style={styles.planRow}>
          <Text style={styles.planLabel}>Plano atual</Text>
          <View style={[styles.badge, isPro ? styles.badgePro : styles.badgeFree]}>
            <Text style={styles.badgeText}>{isPro ? 'Pro' : 'Free'}</Text>
          </View>
        </View>
        {!isPro && (
          <TouchableOpacity style={styles.upgradeButton} onPress={() => router.push('/(app)/paywall')}>
            <Text style={styles.upgradeText}>Fazer upgrade para Pro →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dados corporais */}
      {profile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Corporais</Text>
          <View style={styles.dataGrid}>
            <View style={styles.dataCard}>
              <Text style={styles.dataValue}>{profile.height_cm ?? '—'}</Text>
              <Text style={styles.dataLabel}>Altura (cm)</Text>
            </View>
            <View style={styles.dataCard}>
              <Text style={styles.dataValue}>{profile.weight_kg ?? '—'}</Text>
              <Text style={styles.dataLabel}>Peso (kg)</Text>
            </View>
            <View style={styles.dataCard}>
              <Text style={styles.dataValue}>{profile.biological_sex === 'M' ? 'Masc.' : 'Fem.'}</Text>
              <Text style={styles.dataLabel}>Sexo</Text>
            </View>
            <View style={styles.dataCard}>
              <Text style={styles.dataValue}>{GOAL_LABEL[profile.primary_goal] ?? '—'}</Text>
              <Text style={styles.dataLabel}>Objetivo</Text>
            </View>
          </View>
        </View>
      )}

      {/* Notificações */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Lembretes mensais</Text>
            <Text style={styles.rowDesc}>Receba lembretes para acompanhar sua evolução</Text>
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

      {/* Coach Virtual — Persona */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coach Virtual</Text>
        <View style={styles.personaGrid}>
          {PERSONAS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.personaCard, selectedPersona === p.id && styles.personaCardSelected]}
              onPress={() => handleSelectPersona(p.id)}
              disabled={isSavingPersona}
            >
              <Text style={[styles.personaName, selectedPersona === p.id && styles.personaNameSelected]}>
                {p.name}
              </Text>
              <Text style={styles.personaTagline}>{p.tagline}</Text>
              <Text style={styles.personaExample}>{p.example}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sair */}
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0A0A0A' },
  container: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 48 },
  centered: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 24 },
  planCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 24,
    gap: 12,
  },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planLabel: { color: '#aaa', fontSize: 14 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeFree: { backgroundColor: '#333' },
  badgePro: { backgroundColor: '#4CAF50' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  upgradeButton: { backgroundColor: '#0D1F0D', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#4CAF50' },
  upgradeText: { color: '#4CAF50', fontSize: 14, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  dataGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dataCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  dataValue: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  dataLabel: { color: '#666', fontSize: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { color: '#fff', fontSize: 15, fontWeight: '500', marginBottom: 4 },
  rowDesc: { color: '#666', fontSize: 13, lineHeight: 18 },
  signOutButton: { marginTop: 16, alignItems: 'center', padding: 14 },
  signOutText: { color: '#555', fontSize: 15 },

  personaGrid: { gap: 10 },
  personaCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222',
  },
  personaCardSelected: { borderColor: '#4CAF50', backgroundColor: '#0D1F0D' },
  personaName: { color: '#aaa', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  personaNameSelected: { color: '#4CAF50' },
  personaTagline: { color: '#666', fontSize: 12, marginBottom: 6, fontStyle: 'italic' },
  personaExample: { color: '#444', fontSize: 12, lineHeight: 16 },
})
