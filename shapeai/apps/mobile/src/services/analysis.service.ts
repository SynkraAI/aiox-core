import { apiGet, apiPost } from './api.client'

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

export async function startAnalysis(): Promise<StartAnalysisResponse> {
  return apiPost<StartAnalysisResponse>('/analyses')
}

export async function uploadPhoto(presignedUrl: string, photoUri: string): Promise<void> {
  const response = await fetch(photoUri)
  const blob = await response.blob()

  const upload = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: blob,
  })

  if (!upload.ok) throw new Error(`S3 upload failed: HTTP ${upload.status}`)
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
