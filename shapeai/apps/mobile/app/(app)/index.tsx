import { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image, ScrollView, TextInput,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import Svg, { Circle } from 'react-native-svg'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuthStore } from '../../src/stores/auth.store'
import { useSubscription } from '../../src/hooks/useSubscription'
import { getUserProfile } from '../../src/services/profile.service'
import { listAnalyses, getAnalysisResult } from '../../src/services/analysis.service'
import { GOAL_LABEL, getScoreColor } from '@shapeai/shared'
import type { AnalysisSummary, WorkoutSession, PrimaryGoal } from '@shapeai/shared'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const JS_DAY_TO_NAME: Record<number, string> = {
  1: 'Segunda', 2: 'Terça', 3: 'Quarta', 4: 'Quinta', 5: 'Sexta',
}
const DAY_NAMES: Record<string, string> = {
  '1': 'Segunda', '2': 'Terça', '3': 'Quarta', '4': 'Quinta', '5': 'Sexta',
}
function normalizeDay(d: string) { return DAY_NAMES[d] ?? d }
function storageKey(id: string) { return `workout_progress_${id}` }
function sessionKey(w: number, d: string) { return `${w}_${d}` }
function elapsedWeek(completedAt: string, total: number) {
  const days = Math.floor((Date.now() - new Date(completedAt).getTime()) / 86_400_000)
  return Math.min(Math.max(Math.floor(days / 7), 0), total - 1)
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

type TodayWorkout =
  | { kind: 'rest' | 'none' }
  | { kind: 'session'; session: WorkoutSession; weekNumber: number; analysisId: string; isCompleted: boolean }

// ─── Circular progress ───────────────────────────────────────────────────────

function Ring({ pct, size = 56 }: { pct: number; size?: number }) {
  const R = size / 2 - 5
  const C = 2 * Math.PI * R
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={R} stroke="#1E1E1E" strokeWidth={5} fill="none" />
      <Circle
        cx={size / 2} cy={size / 2} r={R}
        stroke="#4CAF50" strokeWidth={5} fill="none"
        strokeDasharray={`${(pct / 100) * C} ${C}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  )
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { session } = useAuthStore()
  const { subscription } = useSubscription()
  const isPro = subscription?.status === 'pro'

  const [goal, setGoal] = useState<PrimaryGoal | null>(null)
  const [weight, setWeight] = useState<number | null>(null)
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisSummary | null | undefined>(undefined)
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkout | null>(null)
  const [planPct, setPlanPct] = useState(0)
  const [avatarUri, setAvatarUri] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    async function loadAvatar() {
      const [stored, storedName] = await Promise.all([
        AsyncStorage.getItem('user_avatar_uri'),
        AsyncStorage.getItem('user_display_name'),
      ])
      if (stored) setAvatarUri(stored)
      else {
        const oauthAvatar = session?.user?.user_metadata?.avatar_url as string | undefined
        if (oauthAvatar) setAvatarUri(oauthAvatar)
      }
      if (storedName) setDisplayName(storedName)
    }
    loadAvatar()
  }, [session])

  async function saveName() {
    const trimmed = nameInput.trim()
    if (trimmed) {
      await AsyncStorage.setItem('user_display_name', trimmed)
      setDisplayName(trimmed)
    }
    setEditingName(false)
  }

  function startEditingName(currentName: string) {
    setNameInput(currentName)
    setEditingName(true)
  }

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri
      await AsyncStorage.setItem('user_avatar_uri', uri)
      setAvatarUri(uri)
    }
  }

  useEffect(() => {
    async function load() {
      // Profile + análises em paralelo
      const [profileRes, analysesRes] = await Promise.allSettled([
        getUserProfile(),
        listAnalyses(1),
      ])

      if (profileRes.status === 'fulfilled') {
        setGoal(profileRes.value.primary_goal)
        setWeight(profileRes.value.weight_kg ?? null)
      } else {
        const msg = (profileRes.reason as Error).message ?? ''
        if (msg.includes('404') || msg.includes('not found')) {
          router.replace('/(app)/onboarding')
          return
        }
      }

      if (analysesRes.status === 'rejected') { setLastAnalysis(null); return }
      const last = analysesRes.value.analyses.find(a => a.status === 'completed') ?? null
      setLastAnalysis(last)
      if (!last) return

      const result = await getAnalysisResult(last.id)
      const weeks = result.workout_plan.weeks as any[]
      const raw = await AsyncStorage.getItem(storageKey(last.id))
      const completedArr: string[] = raw ? JSON.parse(raw) : []
      const completedSet = new Set(completedArr)

      const total = weeks.reduce((s: number, w: any) => s + w.sessions.length, 0)
      setPlanPct(total > 0 ? Math.round((completedArr.length / total) * 100) : 0)

      const jsDay = new Date().getDay()
      const todayName = JS_DAY_TO_NAME[jsDay]
      if (!todayName) { setTodayWorkout({ kind: 'rest' }); return }

      const week = weeks[elapsedWeek(last.completed_at!, weeks.length)]
      const s = week?.sessions.find((s: WorkoutSession) => normalizeDay(s.day) === todayName) as WorkoutSession | undefined
      if (!s) { setTodayWorkout({ kind: 'rest' }); return }

      setTodayWorkout({
        kind: 'session',
        session: s,
        weekNumber: week.week_number,
        analysisId: last.id,
        isCompleted: completedSet.has(sessionKey(week.week_number, s.day)),
      })
    }

    load().catch(() => setLastAnalysis(null))
  }, [])

  const name = displayName ?? session?.user?.email?.split('@')[0] ?? 'atleta'
  const initial = name.charAt(0).toUpperCase()
  const score = lastAnalysis?.scores?.overall_score ?? null
  const fat = lastAnalysis?.scores?.body_fat_estimate_pct ?? null
  const hasAnalysis = lastAnalysis != null && lastAnalysis !== undefined

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.avatarRow}>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatar} activeOpacity={0.8}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </TouchableOpacity>
          <View>
            {editingName ? (
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                onBlur={saveName}
                onSubmitEditing={saveName}
                autoFocus
                returnKeyType="done"
                maxLength={24}
              />
            ) : (
              <TouchableOpacity onPress={() => startEditingName(name)} activeOpacity={0.7}>
                <Text style={styles.greeting}>Olá, {name} 👋</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.tagline}>Foque. Treine. Evolua.</Text>
          </View>
        </View>
        {isPro ? (
          <LinearGradient
            colors={['#1B4332', '#2D6A4F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.badgePro}
          >
            <Text style={styles.badgeProIcon}>✦</Text>
            <Text style={styles.badgeProText}>Pro</Text>
          </LinearGradient>
        ) : (
          <View style={styles.badgeFree}>
            <Text style={styles.badgeFreeText}>Free</Text>
          </View>
        )}
      </View>

      {/* ── Hero: imagem + fade + texto sobreposto ── */}
      <View style={styles.heroWrapper}>
        <Image
          source={require('../../assets/before-after.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        {/* Fade base: funde com o conteúdo abaixo + texto sobreposto */}
        <LinearGradient
          colors={['transparent', 'rgba(10,10,10,0.75)', '#0A0A0A']}
          style={styles.heroFadeBottom}
          pointerEvents="none"
        />
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroTitle}>
            Veja sua <Text style={styles.heroHighlight}>evolução</Text>{'\n'}antes de começar.
          </Text>
          <Text style={styles.heroSub}>
            Avalie seu shape e evolua com um plano feito para você.
          </Text>
        </View>
      </View>

      {/* ── Avaliação de Shape ── */}
      <View style={styles.evalCard}>
        <View style={styles.evalBody}>
          <Ionicons name="pulse-outline" size={28} color="#4CAF50" />
          <View style={styles.evalText}>
            <Text style={styles.evalTitle}>Avaliar Meu Shape</Text>
            <Text style={styles.evalSub}>
              {hasAnalysis
                ? `Última: ${formatDate(lastAnalysis!.completed_at ?? lastAnalysis!.created_at)}`
                : 'Envie suas fotos e receba uma análise completa com seu score.'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#444" />
        </View>
        <TouchableOpacity style={styles.evalBtn} onPress={() => router.push('/(app)/camera')}>
          <Ionicons name="scan" size={18} color="#fff" />
          <Text style={styles.evalBtnText}>Nova Avaliação</Text>
        </TouchableOpacity>
      </View>

      {/* ── Métricas ── */}
      {lastAnalysis === undefined ? (
        <View style={styles.metricsLoading}>
          <ActivityIndicator size="small" color="#333" />
        </View>
      ) : hasAnalysis ? (
        <View style={styles.metricsRow}>
          <View style={styles.metricBlock}>
            <Text style={[styles.metricValue, { color: score ? getScoreColor(score) : '#fff' }]}>
              {score ?? '—'}
            </Text>
            <Text style={styles.metricLabel}>Score Atual</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>{fat != null ? `${fat.toFixed(1)}%` : '—'}</Text>
            <Text style={styles.metricLabel}>Gordura</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricBlock}>
            <Text style={styles.metricValue}>
              {weight != null ? `${weight}kg` : '—'}
            </Text>
            <Text style={styles.metricLabel}>Peso</Text>
          </View>
        </View>
      ) : null}

      {/* ── Plano de Hoje ── */}
      {todayWorkout !== null && todayWorkout?.kind === 'session' && (
        <TouchableOpacity
          style={styles.planCard}
          onPress={() => router.push(`/(app)/analysis/${todayWorkout.analysisId}/workout`)}
          activeOpacity={0.85}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planLabel}>Treino do Dia</Text>
            <TouchableOpacity onPress={() => router.push(`/(app)/analysis/${todayWorkout.analysisId}/workout`)}>
              <Text style={styles.planLink}>Ver plano completo</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.planBody}>
            <View style={styles.planInfo}>
              <Text style={styles.planFocus}>{todayWorkout.session.focus}</Text>
              <Text style={styles.planMeta}>
                {todayWorkout.session.exercises.length} exercícios · Semana {todayWorkout.weekNumber}
              </Text>
              {todayWorkout.isCompleted && (
                <View style={styles.planDoneBadge}>
                  <Text style={styles.planDoneText}>Concluído ✓</Text>
                </View>
              )}
            </View>
            <View style={styles.planRing}>
              <Ring pct={planPct} size={60} />
              <Text style={styles.planPct}>{planPct}%</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {todayWorkout?.kind === 'rest' && (
        <View style={styles.planCard}>
          <Text style={styles.planLabel}>Treino do Dia</Text>
          <Text style={styles.restText}>🛌  Dia de descanso — volte amanhã mais forte!</Text>
        </View>
      )}
    </ScrollView>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0A0A0A' },
  container: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 48, gap: 20 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#1B3A1B', borderWidth: 1.5, borderColor: '#4CAF50',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImage: { width: 42, height: 42, borderRadius: 21 },
  avatarText: { color: '#4CAF50', fontSize: 17, fontWeight: '800' },
  greeting: { color: '#fff', fontSize: 16, fontWeight: '700' },
  nameInput: {
    color: '#fff', fontSize: 16, fontWeight: '700',
    borderBottomWidth: 1, borderBottomColor: '#4CAF50',
    paddingVertical: 0, minWidth: 80,
  },
  tagline: { color: '#444', fontSize: 12, marginTop: 1 },
  badgeFree: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  badgeFreeText: { color: '#555', fontSize: 12, fontWeight: '600' },
  badgePro: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(76,175,80,0.35)',
  },
  badgeProIcon: { color: 'rgba(255,255,255,0.7)', fontSize: 9 },
  badgeProText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  // Hero
  heroWrapper: {
    width: '100%',
    height: 320,
    borderRadius: 0,
    overflow: 'hidden',
    marginHorizontal: -20,
    width: '120%',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroFadeTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '45%',
  },
  heroFadeBottom: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroTextBlock: {
    position: 'absolute',
    bottom: 20, left: 20, right: 20,
  },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800', lineHeight: 36, marginBottom: 6 },
  heroHighlight: { color: '#4CAF50' },
  heroSub: { color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 20 },

  // Eval card
  evalCard: {
    backgroundColor: '#111', borderRadius: 18,
    padding: 16, gap: 14,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  evalBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  evalText: { flex: 1 },
  evalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  evalSub: { color: '#555', fontSize: 12, marginTop: 2 },
  evalBtn: {
    backgroundColor: '#4CAF50', borderRadius: 12,
    paddingVertical: 13, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  evalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Metrics
  metricsLoading: {
    height: 70, backgroundColor: '#111', borderRadius: 18,
    borderWidth: 1, borderColor: '#1E1E1E',
    alignItems: 'center', justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row', backgroundColor: '#111',
    borderRadius: 18, borderWidth: 1, borderColor: '#1E1E1E',
    paddingVertical: 16,
  },
  metricBlock: { flex: 1, alignItems: 'center', gap: 4 },
  metricDivider: { width: 1, backgroundColor: '#1E1E1E' },
  metricValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  metricLabel: { color: '#444', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

  // Plan card
  planCard: {
    backgroundColor: '#111', borderRadius: 18,
    padding: 18, gap: 14,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planLabel: { color: '#444', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  planLink: { color: '#4CAF50', fontSize: 12, fontWeight: '600' },
  planBody: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  planInfo: { flex: 1, gap: 6 },
  planFocus: { color: '#fff', fontSize: 20, fontWeight: '800' },
  planMeta: { color: '#555', fontSize: 13 },
  planDoneBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1B3A1B', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#4CAF50',
  },
  planDoneText: { color: '#4CAF50', fontSize: 12, fontWeight: '700' },
  planRing: { alignItems: 'center', justifyContent: 'center' },
  planPct: {
    position: 'absolute',
    color: '#fff', fontSize: 12, fontWeight: '800',
  },

  restText: { color: '#555', fontSize: 14, lineHeight: 22 },
})
