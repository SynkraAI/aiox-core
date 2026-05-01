import React from 'react'
import { render } from '@testing-library/react-native'

jest.mock('expo-notifications', () => ({
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}))

jest.mock('expo-router', () => ({
  Stack: ({ children }: { children: React.ReactNode }) => children,
  router: { push: jest.fn() },
}))

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}))

const mockInitialize = jest.fn()
jest.mock('../../src/stores/auth.store', () => ({
  useAuthStore: jest.fn((selector: (s: { initialize: () => void }) => unknown) =>
    selector ? selector({ initialize: mockInitialize }) : { initialize: mockInitialize }
  ),
}))

jest.mock('../../src/services/purchases.service', () => ({
  configurePurchases: jest.fn(),
}))

import * as Notifications from 'expo-notifications'
import { router } from 'expo-router'
import RootLayout from '../../app/_layout'

const mockAddListener = Notifications.addNotificationResponseReceivedListener as jest.Mock
const mockPush = router.push as jest.Mock

describe('RootLayout — handler de notificação', () => {
  beforeEach(() => jest.clearAllMocks())

  it('registra listener de notificação ao montar', () => {
    render(<RootLayout />)
    expect(mockAddListener).toHaveBeenCalledTimes(1)
  })

  it('handler navega para /(app)/camera ao receber resposta de notificação', () => {
    mockAddListener.mockImplementationOnce((cb: () => void) => {
      cb()
      return { remove: jest.fn() }
    })
    render(<RootLayout />)
    expect(mockPush).toHaveBeenCalledWith('/(app)/camera')
  })
})
