import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

// Android SecureStore tem limite de 2048 bytes por valor.
// A sessão do Supabase (~2163 bytes) excede esse limite e causa falha no signup/login.
// Solução: dividir valores grandes em chunks de 1800 bytes e reconstruir na leitura.
const CHUNK_SIZE = 1800

const ChunkedSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const meta = await SecureStore.getItemAsync(key)
      if (!meta) return null
      if (!meta.startsWith('CHUNKS:')) return meta
      const count = parseInt(meta.slice(7), 10)
      const parts: string[] = []
      for (let i = 0; i < count; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}.${i}`)
        if (chunk === null) return null
        parts.push(chunk)
      }
      return parts.join('')
    } catch {
      // Sessão corrompida ou inacessível — trata como ausente
      return null
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value)
      return
    }
    const chunks: string[] = []
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE))
    }
    await SecureStore.setItemAsync(key, `CHUNKS:${chunks.length}`)
    await Promise.all(
      chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}.${i}`, chunk))
    )
  },

  removeItem: async (key: string): Promise<void> => {
    const meta = await SecureStore.getItemAsync(key)
    if (meta?.startsWith('CHUNKS:')) {
      const count = parseInt(meta.slice(7), 10)
      await Promise.all(
        Array.from({ length: count }, (_, i) => SecureStore.deleteItemAsync(`${key}.${i}`))
      )
    }
    await SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ChunkedSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
