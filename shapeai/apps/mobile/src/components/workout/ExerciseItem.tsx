import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { Exercise, formatRest } from '@shapeai/shared'

interface ExerciseItemProps {
  exercise: Exercise
}

export default function ExerciseItem({ exercise }: ExerciseItemProps) {
  function openYoutube() {
    const query = encodeURIComponent(`${exercise.name} como fazer academia`)
    Linking.openURL(`https://www.youtube.com/results?search_query=${query}`)
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{exercise.name}</Text>
          <View style={styles.details}>
            <Text style={styles.detail}>{exercise.sets} séries × {exercise.reps} reps</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.detail}>{formatRest(exercise.rest_seconds)} descanso</Text>
          </View>
          {exercise.note ? <Text style={styles.note}>{exercise.note}</Text> : null}
        </View>
        <TouchableOpacity style={styles.youtubeBtn} onPress={openYoutube}>
          <Text style={styles.youtubeBtnText}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1, gap: 4 },
  name: { color: '#fff', fontSize: 15, fontWeight: '600' },
  details: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detail: { color: '#666', fontSize: 13 },
  dot: { color: '#333', fontSize: 13 },
  note: { color: '#555', fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  youtubeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A1020',
    borderWidth: 1,
    borderColor: '#1E3A6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubeBtnText: { color: '#3B8EF3', fontSize: 13 },
})
