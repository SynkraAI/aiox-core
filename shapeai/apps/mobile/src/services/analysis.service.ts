import { apiGet, apiPost } from './api.client'
import type { ReportSection } from '../components/report/ReportSectionCard'
import type { AnalysisSummary } from '@shapeai/shared'

export interface StartAnalysisResponse {
  analysis_id: string
  upload_urls: { front: string; back: string }
}

export interface AnalysisStatusResponse {
  id: string
  status: 'processing' | 'completed' | 'failed'
  scores?: Record<string, number>
  report?: { highlights: unknown[]; development_areas: unknown[] }
  workout_plan?: { weeks: unknown[] }
  created_at: string
  completed_at?: string
}

export interface MuscleScore {
  score: number
  note: string
}

export interface MuscleScores {
  quadriceps: MuscleScore
  glutes: MuscleScore
  calves: MuscleScore
  biceps: MuscleScore
  triceps: MuscleScore
  chest: MuscleScore
  abs: MuscleScore
  traps: MuscleScore
  lats: MuscleScore
  shoulders: MuscleScore
}

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

export interface WorkoutSession {
  day: number
  muscle_groups: string[]
  exercises: Array<{ name: string; sets: number; reps: string; rest_seconds: number; notes?: string }>
}

export interface WorkoutWeek {
  week_number: number
  sessions: WorkoutSession[]
}

export interface BodyComposition {
  body_fat_estimate: number
  body_fat_category: string
  fat_distribution: string
  fat_areas: string[]
  body_type: string
  muscle_scores: MuscleScores
  overall_score: number
  strengths_summary: string
  weaknesses_summary: string
  overall_assessment: string
  vision_analyzed?: boolean
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
  body_composition?: BodyComposition
  completed_at: string
}

export async function listAnalyses(page: number = 1): Promise<{ analyses: AnalysisSummary[]; has_more: boolean }> {
  const limit = 10
  const offset = (page - 1) * limit
  return apiGet(`/analyses?limit=${limit}&offset=${offset}`)
}

export async function getAnalysisResult(analysisId: string): Promise<AnalysisResult> {
  return apiGet<AnalysisResult>(`/analyses/${analysisId}`)
}

export async function startAnalysis(): Promise<StartAnalysisResponse> {
  return apiPost<StartAnalysisResponse>('/analyses')
}

export async function uploadPhoto(presignedUrl: string, photoUri: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', presignedUrl)
    xhr.setRequestHeader('Content-Type', 'image/jpeg')
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`S3 upload failed: HTTP ${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new Error('Upload failed: network error'))
    // React Native XHR suporta envio direto de file URI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    xhr.send({ uri: photoUri, type: 'image/jpeg', name: 'photo.jpg' } as any)
  })
}

export async function triggerProcessing(analysisId: string): Promise<void> {
  await apiPost(`/analyses/${analysisId}/process`)
}

export async function getAnalysisStatus(analysisId: string): Promise<AnalysisStatusResponse> {
  return apiGet<AnalysisStatusResponse>(`/analyses/${analysisId}`)
}

export async function pollAnalysis(
  analysisId: string,
  options = { intervalMs: 2000, maxAttempts: 120 }
): Promise<AnalysisStatusResponse> {
  let attempts = 0

  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      attempts++

      try {
        const result = await getAnalysisStatus(analysisId)

        if (result.status === 'completed' || result.status === 'failed') {
          clearInterval(interval)
          resolve(result)
          return
        }

        if (attempts >= options.maxAttempts) {
          clearInterval(interval)
          reject(new Error('Tempo limite de análise atingido (4 minutos)'))
        }
      } catch (err) {
        clearInterval(interval)
        reject(err)
      }
    }, options.intervalMs)
  })
}
