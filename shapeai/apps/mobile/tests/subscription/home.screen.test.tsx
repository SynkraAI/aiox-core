import React from 'react'
import { render } from '@testing-library/react-native'

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}))

jest.mock('../../src/stores/auth.store', () => ({
  useAuthStore: () => ({ signOut: jest.fn() }),
}))

jest.mock('../../src/hooks/useSubscription', () => ({
  useSubscription: jest.fn(),
}))

import HomeScreen from '../../app/(app)/index'
import { useSubscription } from '../../src/hooks/useSubscription'

const mockUseSubscription = useSubscription as jest.Mock

describe('HomeScreen — badge Free/Pro', () => {
  beforeEach(() => jest.clearAllMocks())

  it('exibe badge "Free" quando subscription_status é free', () => {
    mockUseSubscription.mockReturnValue({ subscription: { status: 'free', expires_at: null }, isLoading: false })
    const { getByText } = render(<HomeScreen />)
    expect(getByText('Free')).toBeTruthy()
  })

  it('exibe badge "Pro" quando subscription_status é pro', () => {
    mockUseSubscription.mockReturnValue({ subscription: { status: 'pro', expires_at: null }, isLoading: false })
    const { getByText } = render(<HomeScreen />)
    expect(getByText('Pro')).toBeTruthy()
  })

  it('exibe badge "Free" enquanto subscription está carregando (fallback null)', () => {
    mockUseSubscription.mockReturnValue({ subscription: null, isLoading: true })
    const { getByText } = render(<HomeScreen />)
    expect(getByText('Free')).toBeTruthy()
  })
})
