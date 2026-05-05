import { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import Svg, { Circle, Text as SvgText } from 'react-native-svg'
import { getAnalysisResult, AnalysisResult, BodyComposition, MuscleScores } from '../../../../src/services/analysis.service'
import ReportSectionCard, { ReportSection } from '../../../../src/components/report/ReportSectionCard'

const { width: SCREEN_W } = Dimensions.get('window')

const FAT_CATEGORY_LABEL: Record<string, string> = {
  muito_magro: 'Muito magro',
  magro: 'Magro',
  atlético: 'Atlético',
  médio: 'Médio',
  acima_media: 'Acima da média',
  obeso: 'Obeso',
}

const BODY_TYPE_LABEL: Record<string, string> = {
  ectomorfo: 'Ectomorfo',
  mesomorfo: 'Mesomorfo',
  endomorfo: 'Endomorfo',
  misto: 'Misto',
}

const MUSCLE_LABEL: Record<string, string> = {
  quadriceps: 'Quadríceps',
  glutes: 'Glúteos',
  calves: 'Panturrilhas',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  chest: 'Peitoral',
  abs: 'Abdômen',
  traps: 'Trapézio',
  lats: 'Dorsal',
  shoulders: 'Ombros',
}

const MUSCLE_GROUPS = [
  { label: 'Tronco', keys: ['chest', 'lats', 'traps', 'abs', 'shoulders'] },
  { label: 'Braços', keys: ['biceps', 'triceps'] },
  { label: 'Pernas', keys: ['quadriceps', 'glutes', 'calves'] },
]

const TABS = ['Resultado', 'Insights', 'Músculos']

function scoreColor(score: number) {
  if (score >= 70) return '#4CAF50'
  if (score >= 50) return '#FF9800'
  return '#F44336'
}

function scoreLabel(score: number) {
  if (score >= 80) return 'Elite'
  if (score >= 65) return 'Intermediário'
  if (score >= 50) return 'Em progresso'
  return 'Iniciante'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 72
  const strokeWidth = 14
  const circumference = 2 * Math.PI * radius
  const filled = circumference * (score / 100)
  const size = (radius + strokeWidth) * 2
  const cx = size / 2
  const cy = size / 2
  const color = scoreColor(score)

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={radius} stroke="#1A1A1A" strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={cx} cy={cy} r={radius}
        stroke={color} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        rotation="-90" origin={`${cx}, ${cy}`}
      />
      <SvgText x={cx} y={cy + 5} textAnchor="middle" fontSize="36" fontWeight="bold" fill="#fff">
        {score}
      </SvgText>
      <SvgText x={cx} y={cy + 30} textAnchor="middle" fontSize="11" fontWeight="600" fill="#555" letterSpacing="2">
        PTS
      </SvgText>
    </Svg>
  )
}

function ScoreBar({ score }: { score: number }) {
  const color = scoreColor(score)
  return (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { width: `${score}%` as `${number}%`, backgroundColor: color }]} />
    </View>
  )
}

function HeroCard({ score, date }: { score: number; date: string }) {
  const color = scoreColor(score)
  return (
    <View style={s.heroCard}>
      <View style={s.heroTop}>
        <Text style={s.heroTitle}>Score de Shape</Text>
        <Text style={s.heroDate}>{formatDate(date)}</Text>
      </View>
      <View style={s.heroGauge}>
        <ScoreGauge score={score} />
      </View>
      <View style={[s.levelBadge, { borderColor: color + '55' }]}>
        <View style={[s.levelDot, { backgroundColor: color }]} />
        <Text style={[s.levelText, { color }]}>{scoreLabel(score)}</Text>
      </View>
      <Text style={s.heroContext}>Baseado em 9 grupos musculares</Text>
    </View>
  )
}

function AssessmentCard({ text }: { text: string }) {
  return (
    <View style={s.assessmentCard}>
      <Text style={s.assessmentLabel}>Avaliação do especialista</Text>
      <Text style={s.assessmentText}>{text}</Text>
    </View>
  )
}

function CompactBodyComp({ data }: { data: BodyComposition }) {
  const fatColor = data.body_fat_estimate >= 25
    ? '#FF9800'
    : data.body_fat_estimate >= 12
    ? '#4CAF50'
    : '#64B5F6'

  return (
    <View style={s.compactCard}>
      <View style={s.compactTile}>
        <Text style={[s.compactValue, { color: fatColor }]}>{data.body_fat_estimate.toFixed(1)}%</Text>
        <Text style={s.compactLabel}>Gordura</Text>
      </View>
      <View style={s.compactDivider} />
      <View style={s.compactTile}>
        <Text style={s.compactValue}>{FAT_CATEGORY_LABEL[data.body_fat_category] ?? data.body_fat_category}</Text>
        <Text style={s.compactLabel}>Categoria</Text>
      </View>
      <View style={s.compactDivider} />
      <View style={s.compactTile}>
        <Text style={s.compactValue}>{BODY_TYPE_LABEL[data.body_type] ?? data.body_type}</Text>
        <Text style={s.compactLabel}>Biotipo</Text>
      </View>
    </View>
  )
}

function FocusTip({ text }: { text: string }) {
  return (
    <View style={s.focusCard}>
      <Text style={s.focusLabel}>Foco recomendado</Text>
      <Text style={s.focusText}>{text}</Text>
    </View>
  )
}

function InsightsTab({ highlights, devAreas, focusTip }: { highlights: ReportSection[]; devAreas: ReportSection[]; focusTip?: string }) {
  return (
    <ScrollView style={{ width: SCREEN_W }} contentContainerStyle={s.tabContent}>
      {highlights.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Pontos Fortes</Text>
          {highlights.map((item, i) => (
            <ReportSectionCard key={i} section={item} variant="highlight" />
          ))}
        </View>
      )}
      {devAreas.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>A Desenvolver</Text>
          {devAreas.map((item, i) => (
            <ReportSectionCard key={i} section={item} variant="development" />
          ))}
        </View>
      )}
      {focusTip ? <FocusTip text={focusTip} /> : null}
    </ScrollView>
  )
}

function MuscleRanking({ muscle_scores }: { muscle_scores: MuscleScores }) {
  const sorted = (Object.entries(muscle_scores) as [keyof MuscleScores, { score: number }][])
    .filter(([, data]) => data)
    .map(([key, data]) => ({ key, score: data.score }))
    .sort((a, b) => b.score - a.score)

  const top3 = sorted.slice(0, 3)
  const bottom3 = [...sorted].reverse().slice(0, 3)

  return (
    <View style={s.rankingCard}>
      <View style={s.rankingCol}>
        <Text style={[s.rankingTitle, { color: '#4CAF50' }]}>Mais fortes</Text>
        {top3.map(({ key, score }) => (
          <View key={key} style={s.rankingRow}>
            <View style={[s.rankingDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={s.rankingName}>{MUSCLE_LABEL[key] ?? key}</Text>
            <Text style={[s.rankingScore, { color: '#4CAF50' }]}>{score}</Text>
          </View>
        ))}
      </View>
      <View style={s.rankingDivider} />
      <View style={s.rankingCol}>
        <Text style={[s.rankingTitle, { color: '#F44336' }]}>A trabalhar</Text>
        {bottom3.map(({ key, score }) => (
          <View key={key} style={s.rankingRow}>
            <View style={[s.rankingDot, { backgroundColor: '#F44336' }]} />
            <Text style={s.rankingName}>{MUSCLE_LABEL[key] ?? key}</Text>
            <Text style={[s.rankingScore, { color: '#F44336' }]}>{score}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function MusclesTab({ muscle_scores }: { muscle_scores: MuscleScores }) {
  return (
    <ScrollView style={{ width: SCREEN_W }} contentContainerStyle={s.tabContent}>
      <MuscleRanking muscle_scores={muscle_scores} />
      <View style={s.section}>
        <Text style={s.sectionTitle}>Todos os grupos</Text>
        {MUSCLE_GROUPS.map((group, gi) => {
          const rows = group.keys
            .map((key) => ({ key, data: muscle_scores[key as keyof MuscleScores] }))
            .filter((r) => r.data)
          if (rows.length === 0) return null
          return (
            <View key={group.label} style={gi > 0 ? s.muscleGroupGap : undefined}>
              <Text style={s.muscleGroupLabel}>{group.label}</Text>
              {rows.map(({ key, data }) => {
                const color = scoreColor(data!.score)
                return (
                  <View key={key} style={s.muscleRow}>
                    <View style={s.muscleHeader}>
                      <Text style={s.muscleName}>{MUSCLE_LABEL[key] ?? key}</Text>
                      <View style={[s.scoreChip, { borderColor: color + '66', backgroundColor: color + '18' }]}>
                        <Text style={[s.scoreChipText, { color }]}>{data!.score}</Text>
                      </View>
                    </View>
                    <ScoreBar score={data!.score} />
                  </View>
                )
              })}
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const pagerRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (!id) return
    getAnalysisResult(id)
      .then(setAnalysis)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color="#4CAF50" /></View>
  }

  if (error || !analysis) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>{error ?? 'Relatório não encontrado.'}</Text>
      </View>
    )
  }

  const bc = analysis.body_composition
  const overallScore = analysis.scores.overall_score ?? 50
  const highlights: ReportSection[] = analysis.report?.highlights ?? []
  const devAreas: ReportSection[] = analysis.report?.development_areas ?? []

  function goToTab(index: number) {
    pagerRef.current?.scrollTo({ x: index * SCREEN_W, animated: true })
    setCurrentPage(index)
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(app)/history')}>
          <Text style={s.historyBtn}>Histórico</Text>
        </TouchableOpacity>
      </View>

      <View style={s.tabBar}>
        {TABS.map((tab, i) => (
          <TouchableOpacity key={tab} style={s.tabItem} onPress={() => goToTab(i)}>
            <Text style={[s.tabLabel, currentPage === i && s.tabLabelActive]}>{tab}</Text>
            {currentPage === i && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W)
          setCurrentPage(page)
        }}
        style={s.pager}
      >
        {/* Aba 1 — Resultado */}
        <ScrollView style={{ width: SCREEN_W }} contentContainerStyle={s.tabContent}>
          <HeroCard score={overallScore} date={analysis.completed_at} />
          {bc?.overall_assessment ? <AssessmentCard text={bc.overall_assessment} /> : null}
          {bc ? <CompactBodyComp data={bc} /> : null}
          <TouchableOpacity
            style={s.workoutButton}
            onPress={() => router.push(`/(app)/analysis/${id}/workout`)}
          >
            <Text style={s.workoutButtonText}>Ver Plano de Treino</Text>
            <Text style={s.workoutButtonArrow}>→</Text>
          </TouchableOpacity>
          <Text style={s.disclaimerText}>
            Estimativa baseada em análise visual. Consulte um profissional de saúde antes de iniciar qualquer programa de exercícios.
          </Text>
        </ScrollView>

        {/* Aba 2 — Insights */}
        <InsightsTab highlights={highlights} devAreas={devAreas} focusTip={bc?.weaknesses_summary} />

        {/* Aba 3 — Músculos */}
        {bc?.muscle_scores
          ? <MusclesTab muscle_scores={bc.muscle_scores} />
          : <View style={{ width: SCREEN_W }} />
        }
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  center: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#666', fontSize: 16, textAlign: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
  historyBtn: { color: '#555', fontSize: 14 },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    marginHorizontal: 20,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingBottom: 10 },
  tabLabel: { color: '#444', fontSize: 13, fontWeight: '600' },
  tabLabelActive: { color: '#fff' },
  tabUnderline: { position: 'absolute', bottom: 0, height: 2, width: '60%', backgroundColor: '#4CAF50', borderRadius: 1 },

  pager: { flex: 1 },
  tabContent: { padding: 20, paddingBottom: 52 },

  // Hero
  heroCard: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    gap: 14,
  },
  heroTop: { alignItems: 'center', gap: 4 },
  heroTitle: { color: '#bbb', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  heroDate: { color: '#444', fontSize: 12, letterSpacing: 0.5 },
  heroGauge: { marginVertical: 4 },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  levelDot: { width: 6, height: 6, borderRadius: 3 },
  levelText: { fontSize: 13, fontWeight: '600' },
  heroContext: { color: '#333', fontSize: 12, letterSpacing: 0.3 },

  // Assessment
  assessmentCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    gap: 10,
  },
  assessmentLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  assessmentText: { color: '#ccc', fontSize: 15, lineHeight: 24 },

  // Compact body comp
  compactCard: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  compactTile: { flex: 1, alignItems: 'center', gap: 4 },
  compactValue: { color: '#e0e0e0', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  compactLabel: { color: '#444', fontSize: 10, letterSpacing: 0.3 },
  compactDivider: { width: 1, backgroundColor: '#1E1E1E', marginVertical: 4 },

  // Sections (Insights + Muscles tabs)
  section: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    gap: 14,
  },
  sectionTitle: {
    color: '#444',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Focus tip
  focusCard: {
    backgroundColor: '#0E1A0E',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E3A1E',
    gap: 10,
  },
  focusLabel: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  focusText: { color: '#bbb', fontSize: 14, lineHeight: 22 },

  // Muscle ranking
  rankingCard: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    gap: 12,
  },
  rankingCol: { flex: 1, gap: 10 },
  rankingTitle: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 },
  rankingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankingDot: { width: 6, height: 6, borderRadius: 3 },
  rankingName: { flex: 1, color: '#ccc', fontSize: 13 },
  rankingScore: { fontSize: 13, fontWeight: '700' },
  rankingDivider: { width: 1, backgroundColor: '#1E1E1E' },

  // Muscle breakdown
  muscleGroupGap: { marginTop: 16 },
  muscleGroupLabel: {
    color: '#333',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  muscleRow: { gap: 6, marginBottom: 10 },
  muscleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  muscleName: { color: '#ccc', fontSize: 14, fontWeight: '500' },
  scoreChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  scoreChipText: { fontSize: 13, fontWeight: '700' },

  // CTA
  workoutButton: {
    backgroundColor: '#0E1E0E',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#254025',
    gap: 8,
  },
  workoutButtonText: { color: '#4CAF50', fontSize: 16, fontWeight: '700' },
  workoutButtonArrow: { color: '#4CAF50', fontSize: 18 },

  disclaimerText: {
    color: '#2A2A2A',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
})

const barStyles = StyleSheet.create({
  track: { height: 8, backgroundColor: '#1A1A1A', borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
})
