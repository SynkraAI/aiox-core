import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { apiPost } from './api.client'

export async function registerPushToken(): Promise<void> {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return
  const token = (await Notifications.getExpoPushTokenAsync()).data
  await apiPost('/push-tokens', { token, platform: Platform.OS })
}
