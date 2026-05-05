import { View, Text, StyleSheet } from 'react-native'
import MuscleIcon from './MuscleIcon'

export interface ReportSection {
  muscle_group: string
  title: string
  description: string
  score: number
}

interface ReportSectionCardProps {
  section: ReportSection
  variant: 'highlight' | 'development'
}

export default function ReportSectionCard({ section, variant }: ReportSectionCardProps) {
  const accentColor = variant === 'highlight' ? '#4CAF50' : '#FF9800'
  const scoreBg = variant === 'highlight' ? '#1B3A1B' : '#3A2800'

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <MuscleIcon muscle={section.muscle_group} color={accentColor} size={28} />
        <View style={styles.info}>
          <Text style={styles.title}>{section.title}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: scoreBg }]}>
          <Text style={[styles.scoreText, { color: accentColor }]}>{section.score}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1 },
  title: { color: '#fff', fontSize: 15, fontWeight: '600' },
  scoreBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  scoreText: { fontSize: 16, fontWeight: 'bold' },
})
