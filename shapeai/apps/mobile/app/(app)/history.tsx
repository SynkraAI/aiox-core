import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { listAnalyses } from '../../src/services/analysis.service'
import { AnalysisHistoryItem } from '../../src/components/history/AnalysisHistoryItem'
import type { AnalysisSummary } from '@shapeai/shared'
import { useFocusEffect } from 'expo-router'

export default function HistoryScreen() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  const load = useCallback(async (resetPage = false) => {
    const targetPage = resetPage ? 1 : page
    try {
      const data = await listAnalyses(targetPage)
      if (resetPage) {
        setAnalyses(data.analyses)
        setPage(1)
      } else {
        setAnalyses((prev) => [...prev, ...data.analyses])
      }
      setHasMore(data.has_more)
    } catch {
      // mantém estado anterior em caso de erro
    }
  }, [page])

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true)
      load(true).finally(() => setIsLoading(false))
    }, [])
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await load(true)
    setIsRefreshing(false)
  }

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return
    setIsLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    try {
      const data = await listAnalyses(nextPage)
      setAnalyses((prev) => [...prev, ...data.analyses])
      setHasMore(data.has_more)
    } catch {
      setPage(page)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const latestCompletedId = analyses.find((a) => a.status === 'completed')?.id

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#4CAF50" size="large" />
      </View>
    )
  }

  if (analyses.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>Você ainda não fez nenhuma análise</Text>
        <Text style={styles.emptySubtitle}>Capture suas fotos para começar a acompanhar sua evolução.</Text>
        <TouchableOpacity style={styles.startButton} onPress={() => router.push('/(app)/camera')} testID="btn-comecar-agora">
          <Text style={styles.startButtonText}>Começar agora</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico</Text>
      <FlatList
        data={analyses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnalysisHistoryItem
            item={item}
            isLatest={item.id === latestCompletedId}
            onPress={
              item.status === 'completed'
                ? () => router.push(`/(app)/analysis/${item.id}/report` as never)
                : undefined
            }
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#4CAF50" />
        }
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore} disabled={isLoadingMore} testID="btn-carregar-mais">
              {isLoadingMore ? (
                <ActivityIndicator color="#4CAF50" />
              ) : (
                <Text style={styles.loadMoreText}>Carregar mais</Text>
              )}
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  centered: { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', padding: 24, paddingBottom: 12, paddingTop: 60 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#fff', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32 },
  startButton: { backgroundColor: '#4CAF50', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32 },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadMoreButton: { alignItems: 'center', paddingVertical: 20 },
  loadMoreText: { color: '#4CAF50', fontSize: 15, fontWeight: '600' },
})
