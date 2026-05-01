import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { AnalysisHistoryItem } from '../../src/components/history/AnalysisHistoryItem'
import type { AnalysisSummary } from '@shapeai/shared'

const base: AnalysisSummary = {
  id: 'a1',
  status: 'completed',
  scores: null,
  created_at: '2026-04-15T10:00:00Z',
  completed_at: '2026-04-15T10:05:00Z',
  top_development_areas: ['Costas', 'Core'],
}

describe('AnalysisHistoryItem', () => {
  it('exibe data formatada como DD/MM/YYYY', () => {
    const { getByText } = render(<AnalysisHistoryItem item={base} isLatest={false} />)
    expect(getByText('15/04/2026')).toBeTruthy()
  })

  it('exibe badge "Atual" somente quando isLatest=true e status=completed', () => {
    const { getByText } = render(<AnalysisHistoryItem item={base} isLatest={true} />)
    expect(getByText('Atual')).toBeTruthy()
  })

  it('não exibe badge "Atual" quando isLatest=false', () => {
    const { queryByText } = render(<AnalysisHistoryItem item={base} isLatest={false} />)
    expect(queryByText('Atual')).toBeNull()
  })

  it('exibe top_development_areas', () => {
    const { getByText } = render(<AnalysisHistoryItem item={base} isLatest={false} />)
    expect(getByText('• Costas')).toBeTruthy()
    expect(getByText('• Core')).toBeTruthy()
  })

  it('exibe badge "Processando" para status processing', () => {
    const item = { ...base, status: 'processing' as const, top_development_areas: [] }
    const { getByText } = render(<AnalysisHistoryItem item={item} isLatest={false} />)
    expect(getByText('Processando')).toBeTruthy()
  })

  it('chama onPress ao tocar em item completed', () => {
    const onPress = jest.fn()
    const { getByTestId } = render(<AnalysisHistoryItem item={base} isLatest={false} onPress={onPress} />)
    fireEvent.press(getByTestId('history-item-a1'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})
