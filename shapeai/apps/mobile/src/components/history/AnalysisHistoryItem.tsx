import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import type { AnalysisSummary } from '@shapeai/shared'
import { getScoreColor, calculateOverallScore } from '@shapeai/shared'

interface Props {
  item: AnalysisSummary
  isLatest: boolean
  previousScore?: number | null
  onPress?: () => void
  isSelectMode?: boolean
  isSelected?: boolean
  onSelect?: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function AnalysisHistoryItem({ item, isLatest, previousScore, onPress, isSelectMode, isSelected, onSelect }: Props) {
  const isClickable = !isSelectMode && item.status === 'completed' && !!onPress
  const isSelectable = isSelectMode && item.status === 'completed'
  const score = item.scores ? calculateOverallScore(item.scores) : null
  const bodyFat = item.scores?.body_fat_estimate_pct ?? null
  const scoreColor = score != null ? getScoreColor(score) : '#555'
  const delta = score != null && previousScore != null ? score - previousScore : null

  const handlePress = () => {
    if (isSelectable && onSelect) onSelect()
    else if (isClickable && onPress) onPress()
  }

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={handlePress}
      activeOpacity={isClickable || isSelectable ? 0.7 : 1}
      testID={`history-item-${item.id}`}
    >
      <View style={styles.header}>
        <View style={styles.dateRow}>
          {isSelectMode && item.status === 'completed' && (
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]} testID={`checkbox-${item.id}`}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          )}
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.badges}>
          {isLatest && item.status === 'completed' && (
            <View style={styles.badgeLatest}>
              <Text style={styles.badgeLatestText}>Atual</Text>
            </View>
          )}
          {item.status !== 'completed' && (
            <View style={[styles.badgeStatus, item.status === 'processing' ? styles.badgeProcessing : styles.badgeFailed]}>
              <Text style={styles.badgeStatusText}>
                {item.status === 'processing' ? 'Processando' : 'Falhou'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {score != null ? (
        <>
          <View style={styles.metricsRow}>
            <View style={styles.metricBlock}>
              <Text style={[styles.scoreValue, { color: scoreColor }]}>{score}</Text>
              <Text style={styles.metricLabel}>score</Text>
            </View>
            {bodyFat != null && (
              <View style={styles.metricBlock}>
                <Text style={styles.metricValue}>{bodyFat.toFixed(1)}%</Text>
                <Text style={styles.metricLabel}>gordura</Text>
              </View>
            )}
            {delta != null && (
              <View style={styles.metricBlock}>
                <Text style={[styles.deltaValue, { color: delta >= 0 ? '#4CAF50' : '#F44336' }]}>
                  {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} pts
                </Text>
                <Text style={styles.metricLabel}>vs anterior</Text>
              </View>
            )}
          </View>

          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${score}%` as any, backgroundColor: scoreColor }]} />
          </View>
        </>
      ) : (
        <Text style={styles.pending}>
          {item.status === 'processing' ? 'Aguardando análise...' : 'Análise não concluída'}
        </Text>
      )}

      {item.top_development_areas.length > 0 && (
        <View style={styles.areas}>
          {item.top_development_areas.slice(0, 3).map((area, i) => (
            <View key={i} style={styles.areaChip}>
              <Text style={styles.areaChipText}>{area}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  containerSelected: { borderColor: '#4CAF50', backgroundColor: '#0D1F0D' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontSize: 14, fontWeight: '600', color: '#aaa' },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#555', justifyContent: 'center', alignItems: 'center' },
  checkboxSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  badges: { flexDirection: 'row', gap: 6 },
  badgeLatest: { backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeLatestText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  badgeStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeProcessing: { backgroundColor: '#FF9800' },
  badgeFailed: { backgroundColor: '#F44336' },
  badgeStatusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  metricsRow: { flexDirection: 'row', gap: 24, marginBottom: 12, alignItems: 'flex-end' },
  metricBlock: { alignItems: 'flex-start' },
  scoreValue: { fontSize: 36, fontWeight: '800', lineHeight: 40 },
  metricValue: { fontSize: 20, fontWeight: '700', color: '#fff' },
  deltaValue: { fontSize: 16, fontWeight: '700' },
  metricLabel: { fontSize: 11, color: '#555', marginTop: 2, fontWeight: '500' },
  barBg: { height: 6, backgroundColor: '#222', borderRadius: 3, marginBottom: 14, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  areas: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  areaChip: { backgroundColor: '#1A1A1A', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#333' },
  areaChipText: { color: '#888', fontSize: 12 },
  pending: { fontSize: 13, color: '#555', fontStyle: 'italic', marginVertical: 8 },
})
