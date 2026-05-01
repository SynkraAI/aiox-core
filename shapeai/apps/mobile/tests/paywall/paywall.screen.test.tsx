import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
}))

jest.mock('../../src/services/purchases.service', () => ({
  getOfferings: jest.fn().mockResolvedValue({ current: null }),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
  PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: 'purchaseCancelled' },
}))

jest.mock('../../src/hooks/useSubscription', () => ({
  useSubscription: jest.fn().mockReturnValue({
    subscription: { status: 'free', expires_at: null },
    isLoading: false,
    pollUntilPro: jest.fn().mockResolvedValue(undefined),
  }),
}))

import PaywallScreen from '../../app/(app)/paywall'
import { router } from 'expo-router'

const mockReplace = router.replace as jest.Mock

describe('PaywallScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renderiza card Free com lista de limitações', () => {
    const { getByText } = render(<PaywallScreen />)
    expect(getByText('Free')).toBeTruthy()
    expect(getByText('1 análise de shape')).toBeTruthy()
    expect(getByText('Histórico limitado')).toBeTruthy()
    expect(getByText('Sem notificações de progresso')).toBeTruthy()
  })

  it('renderiza card Pro com lista de benefícios', () => {
    const { getByText } = render(<PaywallScreen />)
    expect(getByText('Pro')).toBeTruthy()
    expect(getByText('Análises ilimitadas')).toBeTruthy()
    expect(getByText('Histórico completo')).toBeTruthy()
    expect(getByText('Notificações de progresso')).toBeTruthy()
    expect(getByText('Comparativo de evolução')).toBeTruthy()
  })

  it('exibe preços R$ 39,90 e R$ 299,90', () => {
    const { getByText } = render(<PaywallScreen />)
    expect(getByText('R$ 39,90')).toBeTruthy()
    expect(getByText('R$ 299,90')).toBeTruthy()
  })

  it('exibe badge "Economize 37%"', () => {
    const { getByText } = render(<PaywallScreen />)
    expect(getByText('Economize 37%')).toBeTruthy()
  })

  it('botão "Continuar grátis" chama router.replace("/(app)")', () => {
    const { getByTestId } = render(<PaywallScreen />)
    fireEvent.press(getByTestId('btn-gratis'))
    expect(mockReplace).toHaveBeenCalledWith('/(app)')
  })

  it('botão "Assinar Pro" existe e é clicável', () => {
    const { getByTestId } = render(<PaywallScreen />)
    const btn = getByTestId('btn-assinar-pro')
    expect(btn).toBeTruthy()
    fireEvent.press(btn)
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('botão "Restaurar compra" existe e é clicável', () => {
    const { getByTestId } = render(<PaywallScreen />)
    expect(getByTestId('btn-restaurar')).toBeTruthy()
  })
})
