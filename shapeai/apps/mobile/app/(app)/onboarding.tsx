import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { router } from 'expo-router'
import { createUserProfile } from '../../src/services/profile.service'
import type { UserProfile } from '@shapeai/shared'

type Sex = 'M' | 'F'
type Goal = UserProfile['primary_goal']

const GOAL_OPTIONS: { value: Goal; label: string; description: string }[] = [
  { value: 'hypertrophy', label: 'Hipertrofia', description: 'Ganho de massa muscular' },
  { value: 'fat_loss', label: 'Emagrecimento', description: 'Redução de gordura corporal' },
  { value: 'conditioning', label: 'Condicionamento', description: 'Saúde e performance geral' },
]

export default function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const [sex, setSex] = useState<Sex | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)

  const handleFinish = async () => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (!h || h < 100 || h > 250) {
      Alert.alert('Altura inválida', 'Insira sua altura em cm (ex: 175).')
      return
    }
    if (!w || w < 30 || w > 300) {
      Alert.alert('Peso inválido', 'Insira seu peso em kg (ex: 70).')
      return
    }

    setSaving(true)
    try {
      await createUserProfile({
        biological_sex: sex!,
        primary_goal: goal!,
        height_cm: h,
        weight_kg: w,
      })
      router.replace('/(app)')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      Alert.alert('Erro', msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.progressRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
        ))}
      </View>

      {step === 0 && (
        <View style={styles.step}>
          <Text style={styles.title}>Qual é o seu sexo biológico?</Text>
          <Text style={styles.subtitle}>Usamos para calibrar sua análise corporal</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.optionCard, sex === 'M' && styles.optionCardSelected]}
              onPress={() => setSex('M')}
            >
              <Text style={styles.optionEmoji}>♂️</Text>
              <Text style={styles.optionLabel}>Masculino</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionCard, sex === 'F' && styles.optionCardSelected]}
              onPress={() => setSex('F')}
            >
              <Text style={styles.optionEmoji}>♀️</Text>
              <Text style={styles.optionLabel}>Feminino</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.button, !sex && styles.buttonDisabled]}
            disabled={!sex}
            onPress={() => setStep(1)}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 1 && (
        <View style={styles.step}>
          <Text style={styles.title}>Qual é o seu objetivo?</Text>
          <Text style={styles.subtitle}>Seu plano de treino será personalizado para isso</Text>
          {GOAL_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.goalCard, goal === opt.value && styles.goalCardSelected]}
              onPress={() => setGoal(opt.value)}
            >
              <Text style={styles.goalLabel}>{opt.label}</Text>
              <Text style={styles.goalDescription}>{opt.description}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.button, !goal && styles.buttonDisabled]}
            disabled={!goal}
            onPress={() => setStep(2)}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.back} onPress={() => setStep(0)}>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.step}>
          <Text style={styles.title}>Suas medidas</Text>
          <Text style={styles.subtitle}>Ajuda a tornar o relatório mais preciso</Text>
          <Text style={styles.label}>Altura (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 175"
            placeholderTextColor="#666"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 70"
            placeholderTextColor="#666"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            maxLength={5}
          />
          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            disabled={saving}
            onPress={handleFinish}
          >
            <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Começar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.back} onPress={() => setStep(1)}>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 24,
    justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 48,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  dotActive: {
    backgroundColor: '#4CAF50',
  },
  step: { gap: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  optionCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: { borderColor: '#4CAF50' },
  optionEmoji: { fontSize: 32 },
  optionLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  goalCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardSelected: { borderColor: '#4CAF50' },
  goalLabel: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 2 },
  goalDescription: { color: '#888', fontSize: 13 },
  label: { color: '#aaa', fontSize: 13, marginBottom: -8 },
  input: {
    backgroundColor: '#1A1A1A',
    color: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  back: { alignItems: 'center', padding: 12 },
  backText: { color: '#666', fontSize: 14 },
})
