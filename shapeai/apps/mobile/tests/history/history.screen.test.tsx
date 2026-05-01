import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useFocusEffect: (cb: () => void) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useEffect } = require('react')
    useEffect(cb, [])
  },
}))

jest.mock('../../src/services/analysis.service', () => ({
  listAnalyses: jest.fn(),
}))

import HistoryScreen from '../../app/(app)/history'
import { router } from 'expo-router'
import { listAnalyses } from '../../src/services/analysis.service'

const mockList = listAnalyses as jest.Mock
const mockPush = router.push as jest.Mock

const completedAnalysis = {
  id: 'a1',
  status: 'completed',
  scores: null,
  created_at: '2026-04-15T10:00:00Z',
  completed_at: '2026-04-15T10:05:00Z',
  top_development_areas: ['Costas', 'Core'],
}

const processingAnalysis = {
  id: 'a2',
  status: 'processing',
  scores: null,
  created_at: '2026-04-16T08:00:00Z',
  completed_at: null,
  top_development_areas: [],
}

describe('HistoryScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('exibe estado vazio com botão "Começar agora"', async () => {
    mockList.mockResolvedValue({ analyses: [], has_more: false })
    const { getByTestId } = render(<HistoryScreen />)
    await waitFor(() => expect(getByTestId('btn-comecar-agora')).toBeTruthy())
  })

  it('"Começar agora" navega para câmera', async () => {
    mockList.mockResolvedValue({ analyses: [], has_more: false })
    const { getByTestId } = render(<HistoryScreen />)
    await waitFor(() => fireEvent.press(getByTestId('btn-comecar-agora')))
    expect(mockPush).toHaveBeenCalledWith('/(app)/camera')
  })

  it('exibe análises na lista', async () => {
    mockList.mockResolvedValue({ analyses: [completedAnalysis], has_more: false })
    const { getByText } = render(<HistoryScreen />)
    await waitFor(() => expect(getByText('15/04/2026')).toBeTruthy())
  })

  it('navega para report ao tocar em análise completed', async () => {
    mockList.mockResolvedValue({ analyses: [completedAnalysis], has_more: false })
    const { getByTestId } = render(<HistoryScreen />)
    await waitFor(() => fireEvent.press(getByTestId('history-item-a1')))
    expect(mockPush).toHaveBeenCalledWith('/(app)/analysis/a1/report')
  })

  it('item processing não chama navegação ao ser tocado', async () => {
    mockList.mockResolvedValue({ analyses: [processingAnalysis], has_more: false })
    const { getByTestId } = render(<HistoryScreen />)
    await waitFor(() => fireEvent.press(getByTestId('history-item-a2')))
    expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('/report'))
  })

  it('exibe botão "Carregar mais" quando has_more=true', async () => {
    mockList.mockResolvedValue({ analyses: [completedAnalysis], has_more: true })
    const { getByTestId } = render(<HistoryScreen />)
    await waitFor(() => expect(getByTestId('btn-carregar-mais')).toBeTruthy())
  })
})
