import { useEffect, useState, useCallback, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Image, ScrollView, TextInput, Share, ImageBackground, Animated, Easing,
} from 'react-native'
import { BlurView } from 'expo-blur'
import MaskedView from '@react-native-masked-view/masked-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import Svg, { Circle, Rect, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuthStore } from '../../src/stores/auth.store'
import { PHOTO_TIP_STORAGE_KEY } from './photo-tip'
import { WorkoutShareCard } from '../../src/components/workout/WorkoutShareCard'
import { useSubscription } from '../../src/hooks/useSubscription'
import { getUserProfile } from '../../src/services/profile.service'
import { listAnalyses, getAnalysisResult } from '../../src/services/analysis.service'
import { GOAL_LABEL, getScoreColor } from '@shapeai/shared'
import type { AnalysisSummary, WorkoutSession, PrimaryGoal } from '@shapeai/shared'

// ─── Frases motivacionais ─────────────────────────────────────────────────────

const UNSPLASH_BASE = 'https://images.unsplash.com/photo'

const QUOTES: { text: string; photo: string }[] = [
  { text: 'Consistência bate motivação todo dia.',                                         photo: '1571019613454-1cb2f99b2d8b' },
  { text: 'Seu único concorrente é quem você era ontem.',                                  photo: '1534438327276-14e5300c3a48' },
  { text: 'Progresso, não perfeição.',                                                     photo: '1517836357463-d25dfeac3438' },
  { text: 'Todo grande shape começou com o primeiro treino.',                              photo: '1526506118085-60ce8714f8c5' },
  { text: 'Dor de hoje, resultado de amanhã.',                                             photo: '1581009146145-b5ef050c2e1e' },
  { text: 'Disciplina é a ponte entre metas e conquistas.',                                photo: '1549060279-7e168fcee0c2' },
  { text: 'O corpo alcança o que a mente acredita.',                                       photo: '1541534741688-6078c6bfb5c5' },
  { text: 'Cada repetição te aproxima da melhor versão de você.',                          photo: '1574680096145-d05b474e2155' },
  { text: 'Não pare quando estiver cansado. Pare quando terminar.',                        photo: '1552674605-db5fecabfe68' },
  { text: 'Força não vem do que você consegue fazer. Vem de superar o que achava impossível.', photo: '1506629082955-511b1aa562c8' },
  { text: 'Comece devagar. Só não pare.',                                                  photo: '1571019613454-1cb2f99b2d8b' },
  { text: 'O shape dos seus sonhos exige o esforço que outros evitam.',                    photo: '1534438327276-14e5300c3a48' },
  { text: 'Treinar é um presente que você dá ao seu futuro.',                              photo: '1517836357463-d25dfeac3438' },
  { text: 'Resultados não mentem. Desculpas não treinam.',                                 photo: '1526506118085-60ce8714f8c5' },
  { text: 'Cada dia é uma nova chance de ser melhor.',                                     photo: '1581009146145-b5ef050c2e1e' },
  { text: 'Seu shape é construído fora da zona de conforto.',                              photo: '1549060279-7e168fcee0c2' },
  { text: 'Quem treina hoje, descansa com orgulho amanhã.',                                photo: '1541534741688-6078c6bfb5c5' },
  { text: 'Foco, fé e ferro.',                                                             photo: '1574680096145-d05b474e2155' },
  { text: 'Um treino ruim ainda é melhor que nenhum.',                                     photo: '1552674605-db5fecabfe68' },
  { text: 'Você já chegou até aqui. Não para agora.',                                      photo: '1506629082955-511b1aa562c8' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function getDailyQuote() {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000)
  return QUOTES[dayOfYear % QUOTES.length]
}

function DailyQuoteCard() {
  const { text, photo } = getDailyQuote()
  const uri = `${UNSPLASH_BASE}-${photo}?auto=format&fit=crop&w=800&q=80`

  function handleShare() {
    Share.share({ message: `"${text}" — ShapeAI` })
  }

  return (
    <ImageBackground
      source={{ uri }}
      style={qStyles.card}
      imageStyle={qStyles.image}
    >
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']}
        style={qStyles.overlay}
      >
        <Text style={qStyles.quoteText}>{text}</Text>
        <View style={qStyles.footer}>
          <Text style={qStyles.label}>Motivação</Text>
          <TouchableOpacity style={qStyles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={13} color="#aaa" />
            <Text style={qStyles.shareBtnText}>Compartilhar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  )
}

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
function estimateDuration(exercises: WorkoutSession['exercises']): number {
  const secs = exercises.reduce((acc, ex) => acc + ex.sets * (45 + ex.rest_seconds), 0)
  return Math.round(secs / 60)
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
  const insets = useSafeAreaInsets()
  const { session, isGuest } = useAuthStore()
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
  const [shareVisible, setShareVisible] = useState(false)
  const [planTotalWeeks, setPlanTotalWeeks] = useState(4)
  const [headerHeight, setHeaderHeight] = useState(0)
  const sweepAnim = useRef(new Animated.Value(-160)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(4000),
        Animated.timing(sweepAnim, { toValue: 400, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(sweepAnim, { toValue: -160, duration: 0, useNativeDriver: true }),
      ])
    ).start()
  }, [])

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

  useFocusEffect(useCallback(() => {
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
        if ((msg.includes('404') || msg.includes('not found')) && !isGuest) {
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
      setPlanTotalWeeks(weeks.length)
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
  }, []))

  async function toggleTodaySession() {
    if (todayWorkout?.kind !== 'session') return
    const { analysisId, weekNumber, session: s, isCompleted } = todayWorkout
    const key = sessionKey(weekNumber, s.day)
    const raw = await AsyncStorage.getItem(storageKey(analysisId))
    const set = new Set<string>(raw ? JSON.parse(raw) : [])
    isCompleted ? set.delete(key) : set.add(key)
    await AsyncStorage.setItem(storageKey(analysisId), JSON.stringify([...set]))
    const result = await getAnalysisResult(analysisId)
    const weeks = result.workout_plan.weeks as any[]
    const total = weeks.reduce((acc: number, w: any) => acc + w.sessions.length, 0)
    setPlanPct(total > 0 ? Math.round((set.size / total) * 100) : 0)
    setTodayWorkout({ ...todayWorkout, isCompleted: !isCompleted })
  }

  const name = displayName ?? session?.user?.email?.split('@')[0] ?? 'atleta'
  const initial = name.charAt(0).toUpperCase()
  const score = lastAnalysis?.scores?.overall_score ?? null
  const fat = lastAnalysis?.scores?.body_fat_estimate_pct ?? null
  const hasAnalysis = lastAnalysis != null && lastAnalysis !== undefined

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, { paddingTop: headerHeight }]}
        showsVerticalScrollIndicator={false}
      >

      {/* ── Hero: imagem + fade + texto sobreposto ── */}
      <View style={styles.heroWrapper}>
        <Image
          source={require('../../assets/hero-image.png')}
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
        <TouchableOpacity onPress={async () => {
          const skip = await AsyncStorage.getItem(PHOTO_TIP_STORAGE_KEY)
          router.push((skip === 'true' ? '/(app)/camera' : '/(app)/photo-tip') as never)
        }} activeOpacity={0.85}>
          <LinearGradient
            colors={['#00FF85', '#00FF85', '#2E7D32']}
            locations={[0, 0.45, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.evalBtn}
          >
            <View style={[StyleSheet.absoluteFill, styles.sweepClip]}>
              <Animated.View style={[styles.sweepOverlay, { transform: [{ translateX: sweepAnim }] }]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.14)', 'rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']}
                  locations={[0, 0.15, 0.85, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: 260, height: '100%' }}
                />
              </Animated.View>
            </View>
            <Ionicons name="scan" size={18} color="#0A0A0A" />
            <Text style={[styles.evalBtnText, { color: '#0A0A0A' }]}>{hasAnalysis ? 'Nova Avaliação' : 'Começar Agora'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Métricas ── */}
      {hasAnalysis ? (
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
      ) : lastAnalysis === null ? (
        <View style={styles.firstStepCard}>
          <View style={styles.firstStepHeader}>
            <Ionicons name="trophy-outline" size={20} color="#4CAF50" />
            <Text style={styles.firstStepTitle}>Descubra seu Shape</Text>
          </View>
          {[
            'Score corporal personalizado',
            'Plano de treino em 4 semanas',
            '% de gordura estimada',
          ].map((item) => (
            <View key={item} style={styles.firstStepItem}>
              <Text style={styles.firstStepBullet}>✦</Text>
              <Text style={styles.firstStepText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* ── Plano de Hoje ── */}
      {todayWorkout !== null && todayWorkout?.kind === 'session' && (
        <TouchableOpacity
          style={styles.planCard}
          onPress={() => router.push(`/(app)/analysis/${todayWorkout.analysisId}/workout`)}
          activeOpacity={0.85}
        >
          <View style={styles.planBody}>
            <View style={styles.planInfo}>
              <Text style={styles.planLabel}>Hoje é dia de</Text>
              <Text style={styles.planFocus}>{todayWorkout.session.focus}</Text>
              <Text style={styles.planMeta}>
                {todayWorkout.session.exercises.length} exercícios · ~{estimateDuration(todayWorkout.session.exercises)} min · Sem. {todayWorkout.weekNumber}
              </Text>
            </View>
            <View style={styles.planRing}>
              <Ring pct={planPct} size={60} />
              <Text style={styles.planPct}>{planPct}%</Text>
            </View>
          </View>

          <View style={styles.exercisePreview}>
            {todayWorkout.session.exercises.slice(0, 3).map((ex, i) => (
              <View key={i} style={styles.exerciseRow}>
                <Text style={styles.exerciseName} numberOfLines={1}>{ex.name}</Text>
                <Text style={styles.exerciseSets}>{ex.sets}×{ex.reps}</Text>
              </View>
            ))}
            {todayWorkout.session.exercises.length > 3 && (
              <Text style={styles.exerciseMore}>+{todayWorkout.session.exercises.length - 3} mais</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.completedBtn, todayWorkout.isCompleted && styles.completedBtnDone]}
            onPress={toggleTodaySession}
            activeOpacity={0.8}
          >
            <Ionicons name={todayWorkout.isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'} size={18} color={todayWorkout.isCompleted ? '#4CAF50' : '#fff'} />
            <Text style={[styles.completedBtnText, todayWorkout.isCompleted && styles.completedBtnTextDone]}>
              {todayWorkout.isCompleted ? 'Concluído ✓' : 'Marcar como concluído'}
            </Text>
          </TouchableOpacity>

          <View style={styles.planFooterRow}>
            <TouchableOpacity onPress={() => router.push(`/(app)/analysis/${todayWorkout.analysisId}/workout`)}>
              <Text style={styles.planLink}>Ver plano completo</Text>
            </TouchableOpacity>
            {todayWorkout.isCompleted && (
              <TouchableOpacity style={styles.shareWorkoutBtn} onPress={() => setShareVisible(true)}>
                <Ionicons name="share-outline" size={14} color="#aaa" />
                <Text style={styles.shareWorkoutText}>Compartilhar treino</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      )}

      {todayWorkout?.kind === 'session' && (
        <WorkoutShareCard
          visible={shareVisible}
          onClose={() => setShareVisible(false)}
          session={todayWorkout.session}
          weekNumber={todayWorkout.weekNumber}
          totalWeeks={planTotalWeeks}
          duration={estimateDuration(todayWorkout.session.exercises)}
        />
      )}

      {todayWorkout?.kind === 'rest' && (
        <View style={styles.planCard}>
          <Text style={styles.planLabel}>Treino do Dia</Text>
          <Text style={styles.restText}>🛌  Dia de descanso — volte amanhã mais forte!</Text>
        </View>
      )}

      <DailyQuoteCard />
    </ScrollView>

      {/* ── Glass Header ── */}
      <BlurView intensity={85} tint="dark" style={[styles.glassHeader, { paddingTop: insets.top + 14 }]} onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
        <View style={styles.header}>
          <View style={styles.avatarRow}>
            <LinearGradient
              colors={['#00FF85', '#FFE500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
              <TouchableOpacity onPress={pickAvatar} style={styles.avatar} activeOpacity={0.8}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initial}</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>
            <View>
              <Text style={styles.greetingTime}>{getGreeting()},</Text>
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
                  <Text style={styles.greeting}>{name} 🔥</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.tagline}>Foque. Treine. Evolua.</Text>
            </View>
          </View>
          {isPro ? (
            <LinearGradient
              colors={['#00FF85', '#FFE500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badgeProGradient}
            >
              <View style={styles.badgePro}>
                <MaskedView maskElement={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><MaterialCommunityIcons name="crown" size={11} color="#fff" /><Text style={styles.badgeProText}>PRO</Text></View>}>
                  <LinearGradient colors={['#00FF85', '#FFE500']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><MaterialCommunityIcons name="crown" size={11} color="#fff" style={{ opacity: 0 }} /><Text style={[styles.badgeProText, { opacity: 0 }]}>PRO</Text></View>
                  </LinearGradient>
                </MaskedView>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.badgeFree}>
              <Text style={styles.badgeFreeText}>Free</Text>
            </View>
          )}
        </View>
      </BlurView>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0A' },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 20, paddingBottom: 48, gap: 20 },

  // Glass Header
  glassHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarRing: {
    borderRadius: 27.5,
    padding: 1.5,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#1B3A1B',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImage: { width: 52, height: 52, borderRadius: 26 },
  avatarText: { color: '#4CAF50', fontSize: 20, fontWeight: '800' },
  greetingTime: { color: '#777', fontSize: 13, fontWeight: '500', marginBottom: 1 },
  greeting: { color: '#fff', fontSize: 17, fontWeight: '700' },
  nameInput: {
    color: '#fff', fontSize: 17, fontWeight: '700',
    borderBottomWidth: 1, borderBottomColor: '#4CAF50',
    paddingVertical: 0, minWidth: 80,
  },
  tagline: { color: '#666', fontSize: 12, marginTop: 3 },
  badgeFree: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  badgeFreeText: { color: '#555', fontSize: 12, fontWeight: '600' },
  badgeProGradient: {
    borderRadius: 12,
    padding: 1,
  },
  badgePro: {
    paddingHorizontal: 11, paddingVertical: 5, borderRadius: 11,
    backgroundColor: '#0A0A0A',
  },
  badgeProText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  // Hero
  heroWrapper: {
    width: '120%',
    height: 320,
    borderRadius: 0,
    overflow: 'hidden',
    marginHorizontal: -20,
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
  sweepClip: { borderRadius: 12, overflow: 'hidden' },
  sweepOverlay: { position: 'absolute', top: 0, bottom: 0, width: 260 },

  // First step card (no analysis yet)
  firstStepCard: {
    backgroundColor: '#111', borderRadius: 18,
    borderWidth: 1, borderColor: '#1E1E1E',
    padding: 18, gap: 10,
  },
  firstStepHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2,
  },
  firstStepTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  firstStepItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  firstStepBullet: { color: '#4CAF50', fontSize: 11, fontWeight: '800' },
  firstStepText: { color: '#888', fontSize: 13 },

  // Metrics
  metricsRow: {
    flexDirection: 'row',
    paddingVertical: 4,
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
  planLink: { color: '#4CAF50', fontSize: 13, fontWeight: '600' },
  planBody: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  planInfo: { flex: 1, gap: 6 },
  planFocus: { color: '#fff', fontSize: 20, fontWeight: '800' },
  planMeta: { color: '#555', fontSize: 12 },
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

  exercisePreview: {
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    paddingTop: 12,
    gap: 8,
  },
  exerciseRow: { flexDirection: 'row', alignItems: 'center' },
  exerciseName: { flex: 1, color: '#666', fontSize: 13 },
  exerciseSets: { color: '#444', fontSize: 12 },
  exerciseMore: { color: '#333', fontSize: 12, marginTop: 2 },

  completedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#1A1A1A',
  },
  completedBtnDone: {
    borderColor: '#2A2A2A',
    backgroundColor: '#1A1A1A',
  },
  completedBtnText: { color: '#888', fontSize: 14, fontWeight: '600' },
  completedBtnTextDone: { color: '#4CAF50' },

  planFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    paddingTop: 12,
  },

  shareWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  shareWorkoutText: { color: '#aaa', fontSize: 13, fontWeight: '600' },

  restText: { color: '#555', fontSize: 14, lineHeight: 22 },
})

const qStyles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    height: 220,
  },
  image: {
    borderRadius: 18,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    gap: 8,
  },
  quoteChar: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 36,
    marginBottom: -4,
  },
  quoteText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 23,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  label: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  shareBtnText: {
    color: '#aaa',
    fontSize: 11,
    fontWeight: '600',
  },
})
