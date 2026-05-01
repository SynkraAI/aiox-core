import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react-native'

// Drena toda a fila de microtasks (Promise chains) antes de resolver
const flushAllPromises = () => new Promise<void>(resolve => setImmediate(resolve))

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
}))

jest.mock('../../src/services/purchases.service', () => ({
  getOfferings: jest.fn().mockResolvedValue({
    current: {
      monthly: { product: { priceString: 'R$ 39,90' } },
      annual: { product: { priceString: 'R$ 249,90' } }, // diferente do hardcoded para detectar quando state atualizar
    },
  }),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
  PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: 'purchaseCancelled' },
}))

jest.mock('../../src/hooks/useSubscription', () => ({
  useSubscription: jest.fn(),
}))

import PaywallScreen from '../../app/(app)/paywall'
import { router } from 'expo-router'
import { purchasePackage, restorePurchases, PURCHASES_ERROR_CODE } from '../../src/services/purchases.service'
import { useSubscription } from '../../src/hooks/useSubscription'

const mockPurchase = purchasePackage as jest.Mock
const mockRestore = restorePurchases as jest.Mock
const mockReplace = router.replace as jest.Mock
const mockUseSubscription = useSubscription as jest.Mock

describe('PaywallScreen — fluxo de compra', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // mockReset limpa a fila de implementações Once que clearAllMocks não limpa
    mockPurchase.mockReset()
    mockRestore.mockReset()
    mockUseSubscription.mockReturnValue({
      subscription: { status: 'free', expires_at: null },
      isLoading: false,
      pollUntilPro: jest.fn().mockResolvedValue(undefined),
    })
  })

  it('exibe botão "Assinar Pro" e é clicável', () => {
    const { getByTestId } = render(<PaywallScreen />)
    expect(getByTestId('btn-assinar-pro')).toBeTruthy()
  })

  it('cancela silenciosamente quando erro é PURCHASE_CANCELLED', async () => {
    const cancelErr = Object.assign(new Error('cancelled'), { code: PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR })
    mockPurchase.mockRejectedValueOnce(cancelErr)

    const { getByTestId } = render(<PaywallScreen />)
    fireEvent.press(getByTestId('btn-assinar-pro'))

    await waitFor(() => {
      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  it('navega para home após compra bem-sucedida', async () => {
    mockPurchase.mockResolvedValueOnce({})

    const { getByTestId } = render(<PaywallScreen />)
    await act(flushAllPromises) // drena getOfferings → seta annualPkgRef

    fireEvent.press(getByTestId('btn-assinar-pro'))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(app)')
    })

    expect(mockPurchase).toHaveBeenCalledTimes(1)
  })

  it('chama restorePurchases ao tocar "Restaurar compra"', async () => {
    mockRestore.mockResolvedValueOnce({})

    const { getByTestId } = render(<PaywallScreen />)
    fireEvent.press(getByTestId('btn-restaurar'))

    await waitFor(() => {
      expect(mockRestore).toHaveBeenCalledTimes(1)
    })
  })

  it('navega para home após restauração bem-sucedida', async () => {
    mockRestore.mockResolvedValueOnce({})

    const { getByTestId } = render(<PaywallScreen />)
    fireEvent.press(getByTestId('btn-restaurar'))

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(app)')
    })
  })

  it('botão "Continuar grátis" navega para home', () => {
    const { getByTestId } = render(<PaywallScreen />)
    fireEvent.press(getByTestId('btn-gratis'))
    expect(mockReplace).toHaveBeenCalledWith('/(app)')
  })
})
