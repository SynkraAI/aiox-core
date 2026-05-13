import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'workoutReminderConfig'
const NOTIFICATION_ID_KEY = 'workoutReminderNotificationId'

export interface ReminderConfig {
  enabled: boolean
  hour: number
  minute: number
}

const DEFAULT_CONFIG: ReminderConfig = { enabled: false, hour: 18, minute: 0 }

export async function getReminderConfig(): Promise<ReminderConfig> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_CONFIG
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function saveReminderConfig(config: ReminderConfig): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  await cancelWorkoutReminder()
  if (config.enabled) await scheduleWorkoutReminder(config.hour, config.minute)
}

async function scheduleWorkoutReminder(hour: number, minute: number): Promise<void> {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hora do treino! 💪',
      body: 'Você tem um treino agendado para hoje. Vamos lá!',
      data: { screen: '/(app)/treino' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  })

  await AsyncStorage.setItem(NOTIFICATION_ID_KEY, id)
}

async function cancelWorkoutReminder(): Promise<void> {
  const id = await AsyncStorage.getItem(NOTIFICATION_ID_KEY)
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id)
    await AsyncStorage.removeItem(NOTIFICATION_ID_KEY)
  }
}
