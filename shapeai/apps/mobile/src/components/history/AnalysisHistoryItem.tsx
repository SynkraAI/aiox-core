import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Circle } from 'react-native-svg'
import type { AnalysisSummary } from '@shapeai/shared'
import { getScoreColor, calculateOverallScore } from '@shapeai/shared'

interface Props {
  item: AnalysisSummary
  isLatest: boolean
  index: number
  total: number
  onPress?: () => void
  onWorkout?: () => void
}

const MUSCLE_PT: Record<string, string> = {
  quadriceps: 'Quadríceps',
  glutes: 'Glúteos',
  calves: 'Panturrilhas',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  chest: 'Peitoral',
  abs: 'Abdômen',
  traps: 'Trapézio',
  lats: 'Dorsais',
  shoulders: 'Ombros',
}

function getStrongestMuscle(scores: Record<string, number>): string | null {
  const muscles = ['quadriceps', 'glutes', 'calves', 'biceps', 'triceps', 'chest', 'abs', 'traps', 'lats', 'shoulders']
  let best = muscles[0]
  for (const m of muscles) {
    if ((scores[m] ?? 0) > (scores[best] ?? 0)) best = m
  }
  return MUSCLE_PT[best] ?? best
}

function scoreLabel(score: number): { text: string; color: string } {
  if (score >= 70) return { text: 'Excelente', color: '#4CAF50' }
  if (score >= 40) return { text: 'Ótimo', color: '#8BC34A' }
  return { text: 'Regular', color: '#FF9800' }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const RADIUS = 54
const STROKE = 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ScoreRing({ score, color }: { score: number; color: string }) {
  const progress = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE
  const size = (RADIUS + STROKE) * 2

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* trilha */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS}
          stroke="#1E1E1E"
          strokeWidth={STROKE}
          fill="none"
        />
        {/* progresso */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={progress}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[styles.ringScore, { color }]}>{score}</Text>
      <Text style={styles.ringLabel}>score</Text>
    </View>
  )
}

export function AnalysisHistoryItem({ item, isLatest, index, total, onPress, onWorkout }: Props) {
  const evalNumber = total - index
  const score = item.scores ? calculateOverallScore(item.scores) : null
  const bodyFat = item.scores?.body_fat_estimate_pct ?? null
  const scoreColor = score != null ? getScoreColor(score) : '#555'
  const strongest = item.scores ? getStrongestMuscle(item.scores as unknown as Record<string, number>) : null
  const weakest = item.top_development_areas?.[0] ? (MUSCLE_PT[item.top_development_areas[0]] ?? item.top_development_areas[0]) : null

  if (isLatest && score != null) {
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={onPress}
        activeOpacity={onPress ? 0.75 : 1}
        testID={`history-item-${item.id}`}
      >
        <View style={styles.featuredHeader}>
          <Text style={styles.featuredDate}>{formatDate(item.created_at)}</Text>
          <Text style={styles.evalNumberFeatured}>Mais recente</Text>
        </View>

        <View style={styles.featuredBody}>
          <ScoreRing score={score} color="#4CAF50" />

          <View style={styles.featuredStats}>
            {bodyFat != null && (
              <View style={styles.statBlock}>
                <Text style={styles.statValue}>{bodyFat.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>Gordura corporal</Text>
              </View>
            )}
            {(strongest || weakest) && (
              <View style={styles.muscleRows}>
                {strongest && (
                  <View style={styles.muscleRow}>
                    <Text style={[styles.muscleTriangle, { color: '#4CAF50' }]}>▲</Text>
                    <Text style={styles.muscleText} numberOfLines={1}>{strongest}</Text>
                  </View>
                )}
                {weakest && (
                  <View style={styles.muscleRow}>
                    <Text style={[styles.muscleTriangle, { color: '#F44336' }]}>▼</Text>
                    <Text style={styles.muscleText} numberOfLines={1}>{weakest}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {onWorkout && (
          <TouchableOpacity
            style={styles.workoutButton}
            onPress={onWorkout}
            activeOpacity={0.8}
          >
            <Text style={styles.workoutButtonText}>Ver mais detalhes</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      style={styles.compactCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      testID={`history-item-${item.id}`}
    >
      <View style={styles.compactInner}>
        {/* Conteúdo esquerdo */}
        <View style={styles.compactLeft}>
          <View style={styles.compactHeader}>
            <Text style={styles.compactDate}>{formatDate(item.created_at)}</Text>
            {item.status === 'processing' && (
              <View style={styles.badgeProcessing}>
                <Text style={styles.badgeStatusText}>Processando</Text>
              </View>
            )}
          </View>

          {score != null ? (
            <View style={styles.compactMetrics}>
              <View style={styles.compactMetric}>
                <Text style={[styles.evalNumber, { color: scoreColor }]}>#{evalNumber}</Text>
                <Text style={styles.compactLabel}>avaliação</Text>
              </View>
              {bodyFat != null && (
                <>
                  <View style={styles.metricDivider} />
                  <View style={styles.compactMetric}>
                    <Text style={styles.compactValue}>{bodyFat.toFixed(1)}%</Text>
                    <Text style={styles.compactLabel}>Gordura corporal</Text>
                  </View>
                </>
              )}
              <View style={styles.metricDivider} />
              <View style={styles.compactMetric}>
                <Text style={styles.compactValue}>{scoreLabel(score).text}</Text>
                <Text style={styles.compactLabel}>Resultado</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.pending}>Aguardando análise...</Text>
          )}
        </View>

        {onPress && score != null && (
          <Ionicons name="chevron-forward" size={20} color="#666" style={styles.chevron} />
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  // Card destacado
  featuredCard: {
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2E2E2E',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  featuredDate: { fontSize: 14, color: '#888', fontWeight: '500' },
  featuredBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    marginBottom: 24,
  },
  featuredStats: { flex: 1 },
  statBlock: { marginBottom: 8 },
  statValue: { fontSize: 26, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 12, color: '#555', marginTop: 2 },

  // Ring
  ringScore: { fontSize: 28, fontWeight: '800' },
  ringLabel: { fontSize: 11, color: '#555', marginTop: 2 },

  // Botão treino
  workoutButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  workoutButtonText: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },

  // Card compacto
  compactCard: {
    backgroundColor: '#0F0F0F',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactDate: { fontSize: 13, color: '#666', fontWeight: '500' },
  compactMetrics: { flexDirection: 'row', alignItems: 'center' },
  compactMetric: { flex: 1, alignItems: 'center' },
  compactValue: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 2 },
  compactLabel: { fontSize: 11, color: '#555' },
  metricDivider: { width: 1, height: 32, backgroundColor: '#1E1E1E' },

  // Badges
  badgeLatest: { backgroundColor: '#4CAF50', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeLatestText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  badgeProcessing: { backgroundColor: '#FF9800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeStatusText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  muscleRows: { gap: 8, marginTop: 10 },
  muscleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  muscleTriangle: { fontSize: 10, lineHeight: 14 },
  muscleText: { fontSize: 12, color: '#aaa', fontWeight: '500', flexShrink: 1 },
  evalNumber: { fontSize: 20, fontWeight: '700', color: '#fff' },
  evalNumberFeatured: { fontSize: 16, fontWeight: '600', color: '#4CAF50' },
  pending: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  compactInner: { flexDirection: 'row', alignItems: 'center' },
  compactLeft: { flex: 1 },
  chevron: { marginLeft: 8 },
})
