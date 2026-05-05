import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { pollAnalysis } from '../../../src/services/analysis.service'

const STEPS = [
  'IA analisando suas fotos...',
  'Mapeando grupos musculares...',
  'Identificando pontos fortes...',
  'Detectando áreas a melhorar...',
  'Calculando seu score...',
  'Criando seu plano de treino...',
  'Finalizando relatório...',
]

export default function AnalysisLoadingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [stepIndex, setStepIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [analysisFailed, setAnalysisFailed] = useState(false)

  useEffect(() => {
    if (!id) return

    // Rotaciona mensagens a cada 8s
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length)
    }, 8000)

    pollAnalysis(id)
      .then((result) => {
        clearInterval(stepInterval)
        if (result.status === 'completed') {
          router.replace(`/(app)/analysis/${id}/report`)
        } else {
          setAnalysisFailed(true)
          setError('Não foi possível detectar seu corpo nas fotos.')
        }
      })
      .catch((err: Error) => {
        clearInterval(stepInterval)
        setError(err.message)
      })

    return () => clearInterval(stepInterval)
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

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />
      <Text style={styles.step}>{STEPS[stepIndex]}</Text>
      <Text style={styles.subtitle}>Isso pode levar até 2 minutos</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 32 },
  spinner: { marginBottom: 32 },
  step: { color: '#fff', fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  subtitle: { color: '#555', fontSize: 14, textAlign: 'center' },
  errorEmoji: { fontSize: 48, marginBottom: 16 },
  errorTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  errorMessage: { color: '#888', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  tipBox: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#222',
    alignSelf: 'stretch',
  },
  tipTitle: { color: '#4CAF50', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  tipItem: { color: '#aaa', fontSize: 13, lineHeight: 22 },
  button: { backgroundColor: '#4CAF50', borderRadius: 12, padding: 16, paddingHorizontal: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
