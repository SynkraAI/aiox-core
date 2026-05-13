import { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Alert,
} from 'react-native'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import Svg, { Circle, Text as SvgText } from 'react-native-svg'
import { getAnalysisResult, AnalysisResult, BodyComposition, MuscleScores } from '../../../../src/services/analysis.service'
import ReportSectionCard, { ReportSection } from '../../../../src/components/report/ReportSectionCard'
import { useSubscription } from '../../../../src/hooks/useSubscription'

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
  if (score >= 75) return 'Acima da média'
  if (score >= 50) return 'Na média'
  if (score >= 30) return 'Abaixo da média'
  return 'Bem abaixo da média'
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

function ImageViewerModal({ visible, imageUrl, onClose }: { visible: boolean; imageUrl: string; onClose: () => void }) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita o acesso à galeria para salvar a imagem.')
        return
      }
      const fileUri = FileSystem.cacheDirectory + `shape-futuro-${Date.now()}.jpg`
      const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri)
      await MediaLibrary.saveToLibraryAsync(uri)
      Alert.alert('Salvo!', 'Imagem salva na galeria com sucesso.')
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a imagem.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={iv.container}>
        <TouchableOpacity style={iv.closeBtn} onPress={onClose}>
          <Text style={iv.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <Image source={{ uri: imageUrl }} style={iv.image} resizeMode="contain" />
        <TouchableOpacity style={iv.downloadBtn} onPress={handleDownload} disabled={downloading}>
          {downloading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={iv.downloadBtnText}>↓  Salvar na galeria</Text>
          }
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

function FutureEvolutionCard({ imageUrl, isPro }: { imageUrl: string; isPro: boolean }) {
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <View style={fes.card}>
      <TouchableOpacity
        style={fes.imageWrapper}
        onPress={() => isPro && setModalVisible(true)}
        activeOpacity={isPro ? 0.85 : 1}
      >
        <Image
          source={{ uri: imageUrl }}
          style={fes.image}
          blurRadius={isPro ? 0 : 28}
          resizeMode="contain"
        />
        <View style={fes.labelOverlay}>
          <Text style={fes.label}>SEU SHAPE DOS SONHOS</Text>
        </View>
        {isPro && (
          <View style={fes.expandBtn}>
            <Text style={fes.expandBtnText}>⤢</Text>
          </View>
        )}
        {!isPro && (
          <View style={fes.lockOverlay}>
            <Text style={fes.lockIcon}>🔒</Text>
            <Text style={fes.lockTitle}>Ver shape dos sonhos</Text>
            <Text style={fes.lockSub}>Descubra como seu corpo vai ficar com treino e alimentação consistentes</Text>
            <TouchableOpacity style={fes.upgradeBtn} onPress={() => router.push('/(app)/paywall')}>
              <Text style={fes.upgradeBtnText}>Assinar Pro</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
      {isPro && (
        <Text style={fes.disclaimer}>
          Visualização gerada por IA. Resultados reais dependem de consistência, alimentação e genética individual.
        </Text>
      )}
      {isPro && (
        <ImageViewerModal
          visible={modalVisible}
          imageUrl={imageUrl}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  )
}

export default function ReportScreen() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const pagerRef = useRef<ScrollView>(null)
  const { subscription } = useSubscription()
  const isPro = subscription?.status === 'pro'

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
        <Text style={s.errorText}>{error ?? 'Avaliação não encontrada.'}</Text>
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
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backBtn}>← Voltar</Text>
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
          {analysis.future_self_url ? (
            <FutureEvolutionCard imageUrl={analysis.future_self_url} isPro={isPro} />
          ) : null}
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
    paddingBottom: 12,
  },
  backBtn: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
    marginHorizontal: 20,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 14, paddingBottom: 14 },
  tabLabel: { color: '#444', fontSize: 15, fontWeight: '600' },
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

const fes = StyleSheet.create({
  card: {
    backgroundColor: '#111',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E3A1E',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 3 / 4,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  labelOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  label: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 10, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  lockIcon: { fontSize: 32 },
  lockTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  lockSub: {
    color: '#aaa',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  upgradeBtn: {
    marginTop: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  disclaimer: {
    color: '#333',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    padding: 12,
  },
  expandBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandBtnText: {
    color: '#fff',
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
})

const iv = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_W,
    height: SCREEN_W * (4 / 3),
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  downloadBtn: {
    position: 'absolute',
    bottom: 52,
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    minWidth: 180,
    alignItems: 'center',
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
})
