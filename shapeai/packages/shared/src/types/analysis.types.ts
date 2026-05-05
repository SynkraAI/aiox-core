export type AnalysisStatus = 'processing' | 'completed' | 'failed'

export interface BodyScores {
  quadriceps: number
  glutes: number
  calves: number
  biceps: number
  triceps: number
  chest: number
  abs: number
  traps: number
  lats: number
  overall_score: number
  body_fat_estimate_pct: number
}

export interface Analysis {
  id: string
  user_id: string
  status: AnalysisStatus
  photo_front_url: string | null
  photo_back_url: string | null
  photos_deleted_at: string | null
  scores: BodyScores | null
  created_at: string
  completed_at: string | null
}

export interface StartAnalysisResponse {
  analysis_id: string
  upload_urls: { front: string; back: string }
}

export interface ReportSection {
  muscle_group: string
  title: string
  description: string
  score: number
}

export interface Report {
  id: string
  analysis_id: string
  highlights: ReportSection[]
  development_areas: ReportSection[]
  generated_at: string
}

export interface Exercise {
  name: string
  muscle_group: string
  sets: number
  reps: string
  rest_seconds: number
  note: string | null
}

export interface WorkoutSession {
  day: string
  focus: string
  exercises: Exercise[]
}

export interface WorkoutWeek {
  week_number: number
  sessions: WorkoutSession[]
}

export interface WorkoutPlan {
  id: string
  analysis_id: string
  user_id: string
  duration_weeks: number
  sessions_per_week: number
  weeks: WorkoutWeek[]
  generated_at: string
}

export interface AnalysisSummary {
  id: string
  status: AnalysisStatus
  scores: BodyScores | null
  created_at: string
  completed_at: string | null
  top_development_areas: string[]
}

export interface AnalysisResult {
  id: string
  status: 'completed'
  scores: BodyScores
  report: {
    highlights: ReportSection[]
    development_areas: ReportSection[]
  }
  workout_plan: {
    weeks: WorkoutWeek[]
  }
  created_at: string
  completed_at: string
}

export const MUSCLE_EMOJI: Record<string, string> = {
  quadriceps: '🦵',
  glutes: '🍑',
  calves: '🦵',
  biceps: '💪',
  triceps: '💪',
  chest: '🏋️',
  abs: '🎯',
  traps: '🔝',
  lats: '🔙',
  shoulders: '🏔️',
}

export function formatRest(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return sec > 0 ? `${min}min ${sec}s` : `${min}min`
}

export function getScoreColor(score: number): string {
  if (score >= 70) return '#4CAF50'
  if (score >= 50) return '#FF9800'
  return '#F44336'
}

export function calculateOverallScore(scores: BodyScores): number {
  return scores.overall_score ?? Math.round(
    (scores.quadriceps + scores.glutes + scores.calves +
     scores.biceps + scores.triceps + scores.chest +
     scores.abs + scores.traps + scores.lats + (scores.shoulders ?? 0)) / 10
  )
}
