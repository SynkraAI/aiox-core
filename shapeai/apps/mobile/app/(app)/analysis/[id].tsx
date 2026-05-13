import { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { pollAnalysis } from '../../../src/services/analysis.service'

const STEPS = [
  'IA analisando suas fotos...',
  'Mapeando grupos musculares...',
  'Identificando pontos fortes...',
  'Detectando áreas a melhorar...',
  'Calculando seu score...',
  'Criando seu plano de treino...',
  'Finalizando sua avaliação...',
]

// Progresso suave: cresce rapidamente no início, desacelera e trava em MAX_SOFT_PCT
// aguardando confirmação do backend. Evita mostrar 100% antes do resultado chegar.
const TAU = 30          // constante de tempo em segundos
const MAX_SOFT_PCT = 85 // teto antes do backend confirmar

export default function AnalysisLoadingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisFailed, setAnalysisFailed] = useState(false)
  const startRef = useRef(Date.now())

  // Step deriva do progresso: cada mensagem cobre uma faixa proporcional
  const stepIndex = done
    ? STEPS.length - 1
    : Math.min(Math.floor((progress / MAX_SOFT_PCT) * STEPS.length), STEPS.length - 1)

  useEffect(() => {
    if (!id) return

    const ticker = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000
      const pct = MAX_SOFT_PCT * (1 - Math.exp(-elapsed / TAU))
      setProgress(Math.min(pct, MAX_SOFT_PCT))
    }, 250)

    pollAnalysis(id)
      .then((result) => {
        clearInterval(ticker)
        if (result.status === 'completed') {
          setProgress(100)
          setDone(true)
          setTimeout(() => router.replace(`/(app)/analysis/${id}/report`), 800)
        } else {
          setAnalysisFailed(true)
          setError('Não foi possível detectar seu corpo nas fotos.')
        }
      })
      .catch((err: Error) => {
        clearInterval(ticker)
        setError(err.message)
      })

    return () => clearInterval(ticker)
  }, [id])

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Análise falhou</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        {analysisFailed && (
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Dicas para uma boa foto:</Text>
            <Text style={styles.tipItem}>• Corpo inteiramente visível do topo ao chão</Text>
            <Text style={styles.tipItem}>• Boa iluminação (evite sombras fortes)</Text>
            <Text style={styles.tipItem}>• Fundo neutro e sem outros objetos</Text>
            <Text style={styles.tipItem}>• Roupas justas (mostra o contorno do corpo)</Text>
            <Text style={styles.tipItem}>• Câmera na altura do peito, a ~2m de distância</Text>
          </View>
        )}
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(app)/camera')}>
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const pct = Math.round(progress)
  const fillWidth = `${pct}%` as `${number}%`

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {done ? 'Avaliação concluída ✓' : 'Analisando seu shape...'}
      </Text>

      <View style={styles.barContainer}>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: fillWidth }]} />
        </View>
        <Text style={styles.pctLabel}>{pct}%</Text>
      </View>

      <Text style={styles.step}>{STEPS[stepIndex]}</Text>
      {!done && <Text style={styles.subtitle}>Isso pode levar até 2 minutos</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0A0A0A',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },

  title: {
    color: '#fff', fontSize: 22, fontWeight: '700',
    textAlign: 'center', marginBottom: 32,
  },

  barContainer: {
    width: '100%', flexDirection: 'row',
    alignItems: 'center', gap: 12, marginBottom: 28,
  },
  barTrack: {
    flex: 1, height: 8, backgroundColor: '#1A1A1A',
    borderRadius: 4, overflow: 'hidden',
  },
  barFill: {
    height: '100%', backgroundColor: '#4CAF50', borderRadius: 4,
  },
  pctLabel: {
    color: '#4CAF50', fontSize: 16, fontWeight: '800',
    width: 44, textAlign: 'right',
  },

  step: { color: '#888', fontSize: 15, textAlign: 'center', marginBottom: 8 },
  subtitle: { color: '#444', fontSize: 13, textAlign: 'center' },

  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  errorMessage: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  tipBox: {
    backgroundColor: '#111', borderRadius: 12, padding: 16,
    marginBottom: 24, borderWidth: 1, borderColor: '#222', alignSelf: 'stretch',
  },
  tipTitle: { color: '#4CAF50', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  tipItem: { color: '#aaa', fontSize: 13, lineHeight: 22 },
  button: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, paddingHorizontal: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
