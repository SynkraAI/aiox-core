import { registerPushToken } from '../../src/services/notification.service'

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
}))

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}))

jest.mock('../../src/services/api.client', () => ({
  apiPost: jest.fn(),
}))

import * as Notifications from 'expo-notifications'
import { apiPost } from '../../src/services/api.client'

const mockRequestPermissions = Notifications.requestPermissionsAsync as jest.Mock
const mockGetToken = Notifications.getExpoPushTokenAsync as jest.Mock
const mockApiPost = apiPost as jest.Mock

describe('registerPushToken()', () => {
  beforeEach(() => jest.clearAllMocks())

  it('solicita permissão e registra token com platform corretos', async () => {
    mockRequestPermissions.mockResolvedValueOnce({ status: 'granted' })
    mockGetToken.mockResolvedValueOnce({ data: 'ExponentPushToken[abc123]' })
    mockApiPost.mockResolvedValueOnce({ ok: true })

    await registerPushToken()

    expect(mockApiPost).toHaveBeenCalledWith('/push-tokens', {
      token: 'ExponentPushToken[abc123]',
      platform: 'ios',
    })
  })

  it('não registra token se permissão negada', async () => {
    mockRequestPermissions.mockResolvedValueOnce({ status: 'denied' })

    await registerPushToken()

    expect(mockApiPost).not.toHaveBeenCalled()
  })
})
