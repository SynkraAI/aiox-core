import { apiGet, apiPost, apiPatch } from './api.client'
import type { UserProfile } from '@shapeai/shared'

export async function getUserProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>('/profile')
}

export async function createUserProfile(data: {
  height_cm: number
  weight_kg: number
  biological_sex: 'M' | 'F'
  primary_goal: 'hypertrophy' | 'fat_loss' | 'conditioning'
}): Promise<UserProfile> {
  return apiPost<UserProfile>('/profile', data)
}

export async function updateUserProfile(data: Partial<{
  height_cm: number
  weight_kg: number
  biological_sex: 'M' | 'F'
  primary_goal: 'hypertrophy' | 'fat_loss' | 'conditioning'
  notifications_enabled: boolean
  coach_persona: 'rafael' | 'marina' | 'bruno'
}>): Promise<UserProfile> {
  return apiPatch<UserProfile>('/profile', data)
}
