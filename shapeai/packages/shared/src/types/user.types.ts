export interface User {
  id: string
  email: string
  subscription_status: 'free' | 'pro'
  subscription_expires_at: string | null
  revenuecat_id: string | null
  created_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  height_cm: number
  weight_kg: number
  biological_sex: 'M' | 'F'
  primary_goal: 'hypertrophy' | 'fat_loss' | 'conditioning'
  updated_at: string
}

export type PrimaryGoal = UserProfile['primary_goal']

export const GOAL_LABEL: Record<PrimaryGoal, string> = {
  hypertrophy: 'Hipertrofia',
  fat_loss: 'Emagrecimento',
  conditioning: 'Condicionamento',
}
