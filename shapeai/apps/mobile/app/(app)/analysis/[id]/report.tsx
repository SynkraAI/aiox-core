import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import Svg, { Circle, Text as SvgText } from 'react-native-svg'
import { getAnalysisResult, AnalysisResult, BodyScores, BodyComposition } from '../../../../src/services/analysis.service'
import ReportSectionCard from '../../../../src/components/report/ReportSectionCard'

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

function BodyCompositionCard({ data }: { data: BodyComposition }) {
  return (
    <View style={bcStyles.card}>
      <Text style={bcStyles.title}>Composição Corporal</Text>
      <View style={bcStyles.grid}>
        <View style={bcStyles.stat}>
          <Text style={bcStyles.statValue}>{data.body_fat_estimate.toFixed(1)}%</Text>
          <Text style={bcStyles.statLabel}>Gordura corporal</Text>
        </View>
        <View style={bcStyles.stat}>
          <Text style={bcStyles.statValue}>{FAT_CATEGORY_LABEL[data.body_fat_category] ?? data.body_fat_category}</Text>
          <Text style={bcStyles.statLabel}>Categoria</Text>
        </View>
        <View style={bcStyles.stat}>
          <Text style={bcStyles.statValue}>{BODY_TYPE_LABEL[data.body_type] ?? data.body_type}</Text>
          <Text style={bcStyles.statLabel}>Biotipo</Text>
        </View>
        <View style={bcStyles.stat}>
          <Text style={bcStyles.statValue}>{data.fat_distribution}</Text>
          <Text style={bcStyles.statLabel}>Distribuição de gordura</Text>
        </View>
      </View>
      {data.fat_areas.length > 0 && (
        <View style={bcStyles.tagRow}>
          <Text style={bcStyles.tagLabel}>Gordura localizada:</Text>
          <View style={bcStyles.tags}>
            {data.fat_areas.map((area) => (
              <View key={area} style={bcStyles.tag}>
                <Text style={bcStyles.tagText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      {data.proportional_notes ? (
        <Text style={bcStyles.notes}>{data.proportional_notes}</Text>
      ) : null}
      {data.overall_assessment ? (
        <View style={bcStyles.assessmentBox}>
          <Text style={bcStyles.assessmentText}>"{data.overall_assessment}"</Text>
        </View>
      ) : null}
    </View>
  )
}

function calculateOverallScore(scores: BodyScores): number {
  const values = Object.values(scores) as number[]
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 60
  const strokeWidth = 12
  const circumference = 2 * Math.PI * radius
  const filled = circumference * (score / 100)
  const size = (radius + strokeWidth) * 2

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#1E1E1E"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#4CAF50"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
      <SvgText
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dy="0.3em"
        fontSize="28"
        fontWeight="bold"
        fill="#fff"
      >
        {score}
      </SvgText>
    </Svg>
  )
}

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getAnalysisResult(id)
      .then(setAnalysis)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    )
  }

  if (error || !analysis) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'Relatório não encontrado.'}</Text>
      </View>
    )
  }

  const overallScore = calculateOverallScore(analysis.scores)
  const highlights = analysis.report.highlights.slice(0, 3)
  const developmentAreas = analysis.report.development_areas.slice(0, 3)

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(app)/history')}>
          <Text style={styles.historyBtn}>📋 Histórico</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gaugeContainer}>
        <Text style={styles.gaugeLabel}>Score Geral</Text>
        <ScoreGauge score={overallScore} />
      </View>

      {analysis.body_composition && (
        <BodyCompositionCard data={analysis.body_composition} />
      )}

      <Text style={styles.sectionTitle}>✅ Destaques</Text>
      {highlights.map((section, i) => (
        <ReportSectionCard key={i} section={section} variant="highlight" />
      ))}

      <Text style={styles.sectionTitle}>💪 Áreas de Desenvolvimento</Text>
      {developmentAreas.map((section, i) => (
        <ReportSectionCard key={i} section={section} variant="development" />
      ))}

      <TouchableOpacity
        style={styles.workoutButton}
        onPress={() => router.push(`/(app)/analysis/${id}/workout`)}
      >
        <Text style={styles.workoutButtonText}>Ver Plano de Treino →</Text>
      </TouchableOpacity>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Este relatório é uma estimativa baseada em análise visual e não substitui avaliação
          profissional de saúde. Consulte um profissional antes de iniciar qualquer programa de
          exercícios.
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 24, paddingBottom: 48 },
  center: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#888', fontSize: 16, textAlign: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  backBtn: { color: '#4CAF50', fontSize: 16, fontWeight: '600' },
  historyBtn: { color: '#888', fontSize: 14 },
  gaugeContainer: { alignItems: 'center', marginBottom: 36 },
  gaugeLabel: { color: '#888', fontSize: 14, marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  workoutButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  workoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disclaimer: {
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  disclaimerText: { color: '#555', fontSize: 12, lineHeight: 18, textAlign: 'center' },
})

const bcStyles = StyleSheet.create({
  card: {
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#222',
    gap: 14,
  },
  title: { color: '#888', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 2, textAlign: 'center' },
  statLabel: { color: '#666', fontSize: 11, textAlign: 'center' },
  tagRow: { gap: 6 },
  tagLabel: { color: '#888', fontSize: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#2A1A00', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#FF9800' },
  tagText: { color: '#FF9800', fontSize: 12 },
  notes: { color: '#aaa', fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  assessmentBox: {
    backgroundColor: '#0D1F0D',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2E5E2E',
  },
  assessmentText: { color: '#4CAF50', fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
})
