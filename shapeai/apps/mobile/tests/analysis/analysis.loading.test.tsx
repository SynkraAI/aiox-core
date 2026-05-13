import React from 'react'
import { render, waitFor } from '@testing-library/react-native'

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({ id: 'test-analysis-id' }),
}))

jest.mock('../../src/services/analysis.service', () => ({
  pollAnalysis: jest.fn(),
}))

import AnalysisLoadingScreen from '../../app/(app)/analysis/[id]'
import { pollAnalysis } from '../../src/services/analysis.service'
import { router } from 'expo-router'

const mockPoll = pollAnalysis as jest.Mock
const mockReplace = router.replace as jest.Mock

describe('AnalysisLoadingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('exibe título e step inicial de progresso', () => {
    mockPoll.mockReturnValue(new Promise(() => {})) // never resolves
    const { getByText } = render(<AnalysisLoadingScreen />)
    expect(getByText(/Analisando seu shape/i)).toBeTruthy()
    expect(getByText(/IA analisando suas fotos/i)).toBeTruthy()
  })

  it('navega para report quando status = completed', async () => {
    mockPoll.mockResolvedValue({
      id: 'test-analysis-id',
      status: 'completed',
      created_at: new Date().toISOString(),
    })

    render(<AnalysisLoadingScreen />)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(app)/analysis/test-analysis-id/report')
    }, { timeout: 2000 })
  })

  it('exibe mensagem de erro quando status = failed', async () => {
    mockPoll.mockResolvedValue({
      id: 'test-analysis-id',
      status: 'failed',
      created_at: new Date().toISOString(),
    })

    const { findByText } = render(<AnalysisLoadingScreen />)
    await findByText('Análise falhou')
  })

  it('exibe erro quando poll rejeita (timeout)', async () => {
    mockPoll.mockRejectedValue(new Error('Tempo limite de análise atingido (4 minutos)'))
    const { findByText } = render(<AnalysisLoadingScreen />)
    await findByText(/Tempo limite/i)
  })

  it('exibe botão "Tentar novamente" em estado de erro', async () => {
    mockPoll.mockRejectedValue(new Error('Falha'))
    const { findByText } = render(<AnalysisLoadingScreen />)
    await findByText(/Tentar novamente/i)
  })
})
