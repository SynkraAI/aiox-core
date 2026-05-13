import { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Modal, Pressable, Linking,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { type WorkoutWeek, type WorkoutSession, type PrimaryGoal, GOAL_LABEL } from '@shapeai/shared'
import type { AnalysisSummary } from '@shapeai/shared'
import { listAnalyses, getAnalysisResult } from '../../src/services/analysis.service'
import { getUserProfile } from '../../src/services/profile.service'
import WorkoutDayCard from '../../src/components/workout/WorkoutDayCard'
import { WorkoutShareCard } from '../../src/components/workout/WorkoutShareCard'
import { PHOTO_TIP_STORAGE_KEY } from './photo-tip'

function storageKey(id: string) { return `workout_progress_${id}` }
function estimateDuration(exercises: WorkoutSession['exercises']) {
  return exercises.reduce((sum, ex) => sum + (ex.sets * 2), 0)
}
function sessionKey(w: number, d: string) { return `${w}_${d}` }
function elapsedWeek(completedAt: string, total: number) {
  const days = Math.floor((Date.now() - new Date(completedAt).getTime()) / 86_400_000)
  return Math.min(Math.max(Math.floor(days / 7), 0), total - 1)
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

export default function TreinoTab() {
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(true)
  const [loadingWorkout, setLoadingWorkout] = useState(false)
  const [completedAnalyses, setCompletedAnalyses] = useState<AnalysisSummary[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showPicker, setShowPicker] = useState(false)
  const [weeks, setWeeks] = useState<WorkoutWeek[]>([])
  const [goal, setGoal] = useState<PrimaryGoal | null>(null)
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [shareTarget, setShareTarget] = useState<{ session: WorkoutSession; weekNumber: number } | null>(null)

  const loadWorkout = useCallback(async (analysis: AnalysisSummary, isInitial = false) => {
    if (!isInitial) setLoadingWorkout(true)
    try {
      const result = await getAnalysisResult(analysis.id)
      const w = result.workout_plan.weeks as unknown as WorkoutWeek[]
      setWeeks(w)
      const raw = await AsyncStorage.getItem(storageKey(analysis.id))
      setCompleted(raw ? new Set(JSON.parse(raw)) : new Set())
      setSelectedWeek(analysis.completed_at ? elapsedWeek(analysis.completed_at, w.length) : 0)
    } finally {
      if (!isInitial) setLoadingWorkout(false)
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [analysesRes, profileRes] = await Promise.allSettled([
        listAnalyses(1),
        getUserProfile(),
      ])
      if (profileRes.status === 'fulfilled') setGoal(profileRes.value.primary_goal)
      if (analysesRes.status === 'rejected') return

      const all = analysesRes.value.analyses.filter(a => a.status === 'completed')
      setCompletedAnalyses(all)
      setSelectedIndex(0)
      if (all.length > 0) await loadWorkout(all[0], true)
    } finally {
      setLoading(false)
    }
  }, [loadWorkout])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const handleSelectAnalysis = async (index: number) => {
    setShowPicker(false)
    setSelectedIndex(index)
    await loadWorkout(completedAnalyses[index])
  }

  const toggleSession = useCallback(async (weekNumber: number, day: string) => {
    const analysisId = completedAnalyses[selectedIndex]?.id
    if (!analysisId) return
    const key = sessionKey(weekNumber, day)
    setCompleted((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      AsyncStorage.setItem(storageKey(analysisId), JSON.stringify([...next]))
      return next
    })
  }, [completedAnalyses, selectedIndex])

  const openSpotify = async () => {
    const deepLink = 'spotify:playlist:37i9dQZF1DX76Wlfdnj7AP'
    const webLink = 'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP'
    const canOpen = await Linking.canOpenURL(deepLink)
    await Linking.openURL(canOpen ? deepLink : webLink)
  }

  const handleNewAnalysis = async () => {
    const skip = await AsyncStorage.getItem(PHOTO_TIP_STORAGE_KEY)
    router.push((skip === 'true' ? '/(app)/camera' : '/(app)/photo-tip') as never)
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  if (weeks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="barbell-outline" size={72} color="#1E1E1E" />
        <Text style={styles.emptyTitle}>Nenhum plano de treino</Text>
        <Text style={styles.emptySub}>
          Faça sua avaliação de shape para receber um plano personalizado com base no seu corpo e objetivo.
        </Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={handleNewAnalysis}>
          <Ionicons name="scan" size={18} color="#fff" />
          <Text style={styles.ctaBtnText}>Fazer Avaliação</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const selectedAnalysis = completedAnalyses[selectedIndex]
  const currentWeek = weeks[selectedWeek]
  const goalLabel = goal ? GOAL_LABEL[goal] : '—'
  const sessionsPerWeek = weeks[0]?.sessions.length ?? 0
  const totalSessions = weeks.reduce((s, w) => s + w.sessions.length, 0)
  const completionPct = totalSessions > 0 ? Math.round((completed.size / totalSessions) * 100) : 0
  const completedThisWeek = currentWeek?.sessions.filter(
    s => completed.has(sessionKey(currentWeek.week_number, s.day))
  ).length ?? 0
  const progressWidth = `${sessionsPerWeek > 0 ? Math.round((completedThisWeek / sessionsPerWeek) * 100) : 0}%` as `${number}%`

  return (
    <View style={styles.container}>

      <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <View style={styles.pickerMenu}>
            <Text style={styles.pickerTitle}>Selecionar avaliação</Text>
            {completedAnalyses.map((a, index) => (
              <TouchableOpacity
                key={a.id}
                style={styles.pickerOption}
                onPress={() => handleSelectAnalysis(index)}
              >
                <View>
                  <Text style={[styles.pickerOptionText, index === selectedIndex && styles.pickerOptionTextActive]}>
                    {index === 0 ? 'Mais recente' : `Avaliação de ${formatDate(a.created_at)}`}
                  </Text>
                  <Text style={styles.pickerOptionDate}>{formatDate(a.created_at)}</Text>
                </View>
                {index === selectedIndex && <Ionicons name="checkmark" size={16} color="#4CAF50" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <View style={[styles.headerCard, { paddingTop: insets.top + 16 }]}>
        {completedAnalyses.length > 1 && (
          <View style={styles.pickerRow}>
            <TouchableOpacity style={styles.pickerTrigger} onPress={() => setShowPicker(true)}>
              <Text style={styles.pickerTriggerText}>
                {selectedIndex === 0 ? 'Mais recente' : formatDate(selectedAnalysis.created_at)}
              </Text>
              <Ionicons name="chevron-down" size={12} color="#aaa" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.headerBody}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerLabel}>Seu objetivo</Text>
            <Text style={styles.goalLabel}>{goalLabel}</Text>
            <Text style={styles.planMeta}>4 semanas · {sessionsPerWeek} treinos/semana</Text>
          </View>
          <View style={styles.scoreBlock}>
            {loadingWorkout ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <>
                <Text style={styles.scoreValue}>{completionPct}%</Text>
                <Text style={styles.scorePts}>concluído</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Progresso da semana</Text>
            <Text style={styles.progressCount}>{completedThisWeek} de {sessionsPerWeek} sessões</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.spotifyBtn} onPress={openSpotify} activeOpacity={0.75}>
          <FontAwesome5 name="spotify" size={26} color="#1DB954" />
          <View style={styles.spotifyTextWrap}>
            <Text style={styles.spotifyLabel}>SPOTIFY</Text>
            <Text style={styles.spotifyBtnText}>Abrir playlist</Text>
          </View>
          <Ionicons name="open-outline" size={14} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {weeks.map((week, index) => (
          <TouchableOpacity
            key={week.week_number}
            style={[styles.tab, selectedWeek === index && styles.tabActive]}
            onPress={() => setSelectedWeek(index)}
          >
            <Text style={[styles.tabText, selectedWeek === index && styles.tabTextActive]}>
              Semana {week.week_number}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.daysScroll} contentContainerStyle={styles.daysContent}>
        {loadingWorkout ? (
          <ActivityIndicator color="#4CAF50" style={{ marginTop: 40 }} />
        ) : currentWeek?.sessions.map((session, i) => (
          <WorkoutDayCard
            key={i}
            session={session}
            isCompleted={completed.has(sessionKey(currentWeek.week_number, session.day))}
            onToggle={() => toggleSession(currentWeek.week_number, session.day)}
            onShare={() => setShareTarget({ session, weekNumber: currentWeek.week_number })}
          />
        ))}
      </ScrollView>

      {shareTarget && (
        <WorkoutShareCard
          visible={shareTarget !== null}
          onClose={() => setShareTarget(null)}
          session={shareTarget.session}
          weekNumber={shareTarget.weekNumber}
          totalWeeks={weeks.length}
          duration={estimateDuration(shareTarget.session.exercises)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },

  emptyContainer: {
    flex: 1, backgroundColor: '#0A0A0A',
    justifyContent: 'center', alignItems: 'center', padding: 40, gap: 16,
  },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  emptySub: { color: '#555', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  ctaBtn: {
    backgroundColor: '#4CAF50', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
  },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  headerCard: {
    backgroundColor: '#111',
    borderBottomWidth: 1, borderBottomColor: '#1A1A1A',
    paddingHorizontal: 20, paddingBottom: 16, gap: 14,
  },
  pickerRow: { alignItems: 'center' },
  pickerTrigger: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#2E2E2E',
  },
  pickerTriggerText: { color: '#aaa', fontSize: 12, fontWeight: '600' },

  headerBody: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerInfo: { gap: 3 },
  headerLabel: { color: '#444', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  goalLabel: { color: '#fff', fontSize: 20, fontWeight: '800' },
  planMeta: { color: '#444', fontSize: 13 },
  scoreBlock: { alignItems: 'flex-end', gap: 2, paddingBottom: 2 },
  scoreValue: { fontSize: 34, fontWeight: '800', color: '#4CAF50' },
  scorePts: { color: '#444', fontSize: 11, fontWeight: '600' },

  progressSection: { gap: 8 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { color: '#444', fontSize: 12 },
  progressCount: { color: '#4CAF50', fontSize: 12, fontWeight: '700' },
  progressTrack: { height: 6, backgroundColor: '#1A1A1A', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: '#4CAF50' },

  spotifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  spotifyTextWrap: { flex: 1, gap: 1 },
  spotifyLabel: { color: '#1DB954', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  spotifyBtnText: { color: '#aaa', fontSize: 13 },

  tabsScroll: { maxHeight: 56, marginTop: 8 },
  tabsContent: { paddingHorizontal: 20, paddingVertical: 8, gap: 8, alignItems: 'center' },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#111', borderWidth: 1, borderColor: '#1E1E1E',
  },
  tabActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  tabText: { color: '#888', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  daysScroll: { flex: 1 },
  daysContent: { padding: 20, paddingBottom: 40 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  pickerMenu: { backgroundColor: '#111', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  pickerTitle: { fontSize: 13, color: '#555', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  pickerOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  pickerOptionText: { fontSize: 16, color: '#888' },
  pickerOptionTextActive: { color: '#fff', fontWeight: '600' },
  pickerOptionDate: { fontSize: 12, color: '#444', marginTop: 2 },
})
