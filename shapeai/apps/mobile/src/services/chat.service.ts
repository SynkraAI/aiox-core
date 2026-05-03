import { supabase } from './supabase.client'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

export interface ChatUsage {
  count: number
  limit: number | null
}

export interface ChatResponse {
  reply: string
  persona: string
  usage: ChatUsage
}

export interface ChatLimitError {
  type: 'limit_reached'
  usage: ChatUsage
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function sendChatMessage(message: string): Promise<ChatResponse | ChatLimitError> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ message }),
  })

  const data = await res.json()

  if (res.status === 402) {
    return { type: 'limit_reached', usage: data.usage as ChatUsage }
  }

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
  }

  return data as ChatResponse
}

export async function getChatUsage(): Promise<ChatUsage> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}/chat/usage`, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<ChatUsage>
}
