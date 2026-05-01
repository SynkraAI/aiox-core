import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import type { AnalysisSummary } from '@shapeai/shared'

interface Props {
  item: AnalysisSummary
  isLatest: boolean
  onPress?: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export function AnalysisHistoryItem({ item, isLatest, onPress }: Props) {
  const isClickable = item.status === 'completed' && !!onPress

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={isClickable ? onPress : undefined}
      activeOpacity={isClickable ? 0.7 : 1}
      testID={`history-item-${item.id}`}
    >
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
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

      {item.top_development_areas.length > 0 ? (
        <View style={styles.areas}>
          {item.top_development_areas.map((area, i) => (
            <Text key={i} style={styles.area} numberOfLines={1}>• {area}</Text>
          ))}
        </View>
      ) : (
        <Text style={styles.noAreas}>
          {item.status === 'completed' ? 'Relatório disponível' : 'Aguardando análise...'}
        </Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  date: { fontSize: 15, fontWeight: '600', color: '#fff' },
  badges: { flexDirection: 'row', gap: 6 },
  badgeLatest: { backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeLatestText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  badgeStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeProcessing: { backgroundColor: '#FF9800' },
  badgeFailed: { backgroundColor: '#F44336' },
  badgeStatusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  areas: { gap: 4 },
  area: { fontSize: 13, color: '#aaa', lineHeight: 18 },
  noAreas: { fontSize: 13, color: '#555', fontStyle: 'italic' },
})
