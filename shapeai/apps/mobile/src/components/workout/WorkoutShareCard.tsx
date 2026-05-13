import { useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Alert, ActivityIndicator, Share,
} from 'react-native'
import { useState } from 'react'
import ViewShot from 'react-native-view-shot'
import * as MediaLibrary from 'expo-media-library'
import { Ionicons } from '@expo/vector-icons'
import type { WorkoutSession } from '@shapeai/shared'

interface Props {
  visible: boolean
  onClose: () => void
  session: WorkoutSession
  weekNumber: number
  totalWeeks: number
  duration: number
}

export function WorkoutShareCard({ visible, onClose, session, weekNumber, totalWeeks, duration }: Props) {
  const viewShotRef = useRef<ViewShot>(null)
  const [saving, setSaving] = useState(false)

  async function captureCard() {
    const uri = await (viewShotRef.current as any).capture()
    return uri as string
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita o acesso à galeria para salvar.')
        return
      }
      const uri = await captureCard()
      await MediaLibrary.saveToLibraryAsync(uri)
      Alert.alert('Salvo!', 'Card salvo na galeria.')
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o card.')
    } finally {
      setSaving(false)
    }
  }

  async function handleShare() {
    setSaving(true)
    try {
      const uri = await captureCard()
      await Share.share({ url: uri, message: `Treino de ${session.focus} concluído! 💪 — ShapeAI` })
    } catch {
      Alert.alert('Erro', 'Não foi possível compartilhar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={s.overlay}>
        <View style={s.sheet}>

          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Compartilhar treino</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Card que será capturado */}
          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }} style={s.cardWrapper}>
            <View style={s.card}>
              {/* Topo */}
              <View style={s.cardHeader}>
                <Text style={s.brand}>ShapeAI</Text>
                <View style={s.weekBadge}>
                  <Text style={s.weekBadgeText}>Sem. {weekNumber} de {totalWeeks}</Text>
                </View>
              </View>

              {/* Título */}
              <Text style={s.focus}>{session.focus}</Text>
              <Text style={s.week}>Semana {weekNumber}</Text>

              {/* Stats */}
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={s.statValue}>{session.exercises.length}</Text>
                  <Text style={s.statLabel}>exercícios</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.stat}>
                  <Text style={s.statValue}>~{duration}</Text>
                  <Text style={s.statLabel}>minutos</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.stat}>
                  <Text style={s.statValue}>✓</Text>
                  <Text style={s.statLabel}>concluído</Text>
                </View>
              </View>

              {/* Exercícios */}
              <View style={s.exerciseList}>
                {session.exercises.slice(0, 5).map((ex, i) => (
                  <View key={i} style={s.exerciseRow}>
                    <Text style={s.exerciseName} numberOfLines={1}>{ex.name}</Text>
                    <Text style={s.exerciseSets}>{ex.sets}×{ex.reps}</Text>
                  </View>
                ))}
                {session.exercises.length > 5 && (
                  <Text style={s.exerciseMore}>+{session.exercises.length - 5} exercícios</Text>
                )}
              </View>

              {/* Rodapé */}
              <View style={s.cardFooter}>
                <Text style={s.footerText}>shapeai.app</Text>
                <View style={s.dot} />
                <Text style={s.footerText}>Análise corporal com IA</Text>
              </View>
            </View>
          </ViewShot>

          {/* Ações */}
          <View style={s.actions}>
            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                    <Ionicons name="download-outline" size={18} color="#fff" />
                    <Text style={s.saveBtnText}>Salvar</Text>
                  </>
              }
            </TouchableOpacity>
            <TouchableOpacity style={s.shareBtn} onPress={handleShare} disabled={saving}>
              <Ionicons name="share-outline" size={18} color="#4CAF50" />
              <Text style={s.shareBtnText}>Compartilhar</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  )
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0F0F0F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },

  cardWrapper: { borderRadius: 20, overflow: 'hidden' },
  card: {
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    gap: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: { color: '#4CAF50', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  weekBadge: {
    backgroundColor: '#1B3A1B',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#4CAF5044',
  },
  weekBadgeText: { color: '#4CAF50', fontSize: 12, fontWeight: '700' },

  focus: { color: '#fff', fontSize: 28, fontWeight: '800', lineHeight: 34 },
  week: { color: '#444', fontSize: 13, marginTop: -8 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#444', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, backgroundColor: '#1A1A1A' },

  exerciseList: { gap: 8 },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#141414',
  },
  exerciseName: { flex: 1, color: '#888', fontSize: 13 },
  exerciseSets: { color: '#555', fontSize: 12, fontWeight: '600' },
  exerciseMore: { color: '#333', fontSize: 12, marginTop: 2 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  footerText: { color: '#2A2A2A', fontSize: 11 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#2A2A2A' },

  actions: { flexDirection: 'row', gap: 12 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  shareBtn: {
    flex: 2,
    backgroundColor: '#0E1E0E',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#254025',
  },
  shareBtnText: { color: '#4CAF50', fontSize: 15, fontWeight: '700' },
})
