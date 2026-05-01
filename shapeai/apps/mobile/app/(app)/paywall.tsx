import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  PURCHASES_ERROR_CODE,
} from '../../src/services/purchases.service'
import type { PurchasesPackage } from '../../src/services/purchases.service'
import { useSubscription } from '../../src/hooks/useSubscription'

const FREE_LIMITATIONS = [
  '1 análise de shape',
  'Histórico limitado',
  'Sem notificações de progresso',
  'Sem comparativo de evolução',
]

const PRO_BENEFITS = [
  'Análises ilimitadas',
  'Histórico completo',
  'Notificações de progresso',
  'Comparativo de evolução',
]

type Plan = 'monthly' | 'annual'

export default function PaywallScreen() {
  const { pollUntilPro } = useSubscription()
  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual')
  // Refs para packages: usados apenas em event handlers, evitando stale closures
  const monthlyPkgRef = useRef<PurchasesPackage | null>(null)
  const annualPkgRef = useRef<PurchasesPackage | null>(null)
  const [monthlyPrice, setMonthlyPrice] = useState('R$ 39,90')
  const [annualPrice, setAnnualPrice] = useState('R$ 299,90')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getOfferings()
      .then((offerings) => {
        const monthly = offerings.current?.monthly
        const annual = offerings.current?.annual
        if (monthly) {
          monthlyPkgRef.current = monthly
          setMonthlyPrice(monthly.product.priceString)
        }
        if (annual) {
          annualPkgRef.current = annual
          setAnnualPrice(annual.product.priceString)
        }
      })
      .catch(() => {}) // fallback to hardcoded prices
  }, [])

  const handleSubscribe = async () => {
    const pkg = selectedPlan === 'monthly' ? monthlyPkgRef.current : annualPkgRef.current
    if (!pkg) {
      Alert.alert('Indisponível', 'Plano não disponível no momento. Tente novamente.')
      return
    }

    setIsLoading(true)
    try {
      await purchasePackage(pkg)
      await pollUntilPro()
      router.replace('/(app)')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return
      Alert.alert('Erro na compra', 'Não foi possível processar a compra. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async () => {
    setIsLoading(true)
    try {
      await restorePurchases()
      await pollUntilPro()
      router.replace('/(app)')
    } catch {
      Alert.alert('Erro', 'Não foi possível restaurar a compra.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} bounces={false}>
      <Text style={styles.title}>Escolha seu plano</Text>
      <Text style={styles.subtitle}>Desbloqueie todo o potencial do ShapeAI</Text>

      <View style={styles.cards}>
        <View style={[styles.card, styles.cardFree]}>
          <Text style={styles.cardTitle}>Free</Text>
          {FREE_LIMITATIONS.map((item) => (
            <View key={item} style={styles.row}>
              <Text style={styles.iconFree}>❌</Text>
              <Text style={styles.itemTextFree}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.cardPro]}>
          <Text style={styles.cardTitle}>Pro</Text>
          {PRO_BENEFITS.map((item) => (
            <View key={item} style={styles.row}>
              <Text style={styles.iconPro}>✅</Text>
              <Text style={styles.itemTextPro}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.pricing}>
        <TouchableOpacity
          style={[styles.priceRow, selectedPlan === 'monthly' && styles.priceRowSelected]}
          onPress={() => setSelectedPlan('monthly')}
          testID="plan-monthly"
        >
          <Text style={styles.priceLabel}>Mensal</Text>
          <Text style={styles.priceValue}>{monthlyPrice}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.priceRow, styles.priceRowAnnual, selectedPlan === 'annual' && styles.priceRowSelected]}
          onPress={() => setSelectedPlan('annual')}
          testID="plan-annual"
        >
          <View style={styles.priceRowLeft}>
            <Text style={styles.priceLabel}>Anual</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Economize 37%</Text>
            </View>
          </View>
          <Text style={styles.priceValue}>{annualPrice}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.ctaButton, isLoading && styles.ctaButtonDisabled]}
        onPress={handleSubscribe}
        disabled={isLoading}
        testID="btn-assinar-pro"
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.ctaText}>Assinar Pro</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={isLoading}
        testID="btn-restaurar"
      >
        <Text style={styles.restoreText}>Restaurar compra</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.freeButton}
        onPress={() => router.replace('/(app)')}
        testID="btn-gratis"
      >
        <Text style={styles.freeText}>Continuar grátis</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#0A0A0A' },
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginTop: 48, marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 32 },
  cards: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  card: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1 },
  cardFree: { backgroundColor: '#111', borderColor: '#333' },
  cardPro: { backgroundColor: '#0D1F0D', borderColor: '#4CAF50' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  iconFree: { fontSize: 12, marginTop: 2 },
  iconPro: { fontSize: 12, marginTop: 2 },
  itemTextFree: { flex: 1, fontSize: 13, color: '#666', lineHeight: 18 },
  itemTextPro: { flex: 1, fontSize: 13, color: '#ccc', lineHeight: 18 },
  pricing: { backgroundColor: '#111', borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#222', overflow: 'hidden' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  priceRowAnnual: { borderTopWidth: 1, borderTopColor: '#222' },
  priceRowSelected: { backgroundColor: '#0D1F0D' },
  priceRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceLabel: { color: '#aaa', fontSize: 15 },
  priceValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  saveBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  saveBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  ctaButton: { backgroundColor: '#4CAF50', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 12 },
  ctaButtonDisabled: { opacity: 0.6 },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  restoreButton: { alignItems: 'center', padding: 10, marginBottom: 8 },
  restoreText: { color: '#555', fontSize: 13 },
  freeButton: { alignItems: 'center', padding: 10 },
  freeText: { color: '#666', fontSize: 14 },
})
