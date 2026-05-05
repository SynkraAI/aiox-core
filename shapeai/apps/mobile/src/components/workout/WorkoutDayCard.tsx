import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import type { WorkoutSession } from '@shapeai/shared'
import ExerciseItem from './ExerciseItem'

const DAY_NAMES: Record<string, string> = {
  '1': 'Segunda', '2': 'Terça', '3': 'Quarta',
  '4': 'Quinta',  '5': 'Sexta', '6': 'Sábado', '7': 'Domingo',
}

function normalizeDay(day: string): string {
  return DAY_NAMES[day] ?? day
}

interface WorkoutDayCardProps {
  session: WorkoutSession
  isCompleted: boolean
  onToggle: () => void
}

export default function WorkoutDayCard({ session, isCompleted, onToggle }: WorkoutDayCardProps) {
  return (
    <View style={[styles.container, isCompleted && styles.containerDone]}>
      <View style={styles.header}>
        <View style={styles.dayBadge}>
          <Text style={styles.dayText}>{normalizeDay(session.day)}</Text>
        </View>
        <Text style={styles.focus}>{session.focus}</Text>
        {isCompleted && <Text style={styles.doneTag}>✓</Text>}
      </View>
      <View style={styles.divider} />
      <View style={isCompleted ? styles.exercisesDimmed : undefined}>
        {session.exercises.map((exercise, index) => (
          <ExerciseItem key={index} exercise={exercise} />
        ))}
      </View>
      <TouchableOpacity
        style={[styles.doneBtn, isCompleted && styles.doneBtnActive]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={[styles.doneBtnText, isCompleted && styles.doneBtnTextActive]}>
          {isCompleted ? 'Concluída ✓' : 'Marcar como feito →'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  containerDone: {
    borderColor: '#4CAF50',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  dayBadge: {
    backgroundColor: '#0E1E0E',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#254025',
  },
  dayText: { color: '#4CAF50', fontSize: 12, fontWeight: '700' },
  focus: { color: '#fff', fontSize: 17, fontWeight: '700', flex: 1 },
  doneTag: { color: '#4CAF50', fontSize: 16, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#1A1A1A', marginBottom: 12 },
  exercisesDimmed: { opacity: 0.4 },
  doneBtn: {
    marginTop: 14,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  doneBtnActive: {
    backgroundColor: '#1B3A1B',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  doneBtnText: { color: '#0A0A0A', fontSize: 14, fontWeight: '700' },
  doneBtnTextActive: { color: '#4CAF50', fontSize: 14, fontWeight: '700' },
})
