import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
}))

jest.mock('../../src/services/api.client', () => ({
  apiGet: jest.fn(),
  apiPatch: jest.fn(),
}))

import ProfileScreen from '../../app/(app)/profile'
import { apiGet, apiPatch } from '../../src/services/api.client'

const mockGet = apiGet as jest.Mock
const mockPatch = apiPatch as jest.Mock

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockResolvedValue({ notifications_enabled: true })
    mockPatch.mockResolvedValue({ notifications_enabled: false })
  })

  it('exibe toggle de notificações', async () => {
    const { getByTestId } = render(<ProfileScreen />)
    await waitFor(() => expect(getByTestId('toggle-notifications')).toBeTruthy())
  })

  it('toggle desativado chama PATCH /profile com notifications_enabled: false', async () => {
    const { getByTestId } = render(<ProfileScreen />)
    await waitFor(() => getByTestId('toggle-notifications'))
    fireEvent(getByTestId('toggle-notifications'), 'valueChange', false)
    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/profile', { notifications_enabled: false })
    })
  })

  it('toggle revertido se PATCH falha', async () => {
    mockPatch.mockRejectedValueOnce(new Error('Network error'))
    const { getByTestId } = render(<ProfileScreen />)
    await waitFor(() => getByTestId('toggle-notifications'))
    const toggle = getByTestId('toggle-notifications')
    fireEvent(toggle, 'valueChange', false)
    await waitFor(() => {
      expect(toggle.props.value).toBe(true)
    })
  })
})
