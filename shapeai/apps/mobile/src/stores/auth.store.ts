import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase.client'

interface AuthState {
  session: Session | null
  isLoading: boolean
  initialize: () => () => void
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,

  initialize: () => {
    supabase.auth.getSession().then(({ data }) => {
      set({ session: data.session, isLoading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session })
    })

    return () => subscription.unsubscribe()
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ isLoading: false })
    if (error) return mapAuthError(error.message)
    return null
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true })
    const { error } = await supabase.auth.signUp({ email, password })
    set({ isLoading: false })
    if (error) return mapAuthError(error.message)
    return null
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null })
  },
}))

const AUTH_ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'Email ou senha incorretos.',
  'Email not confirmed': 'Confirme seu email antes de entrar.',
  'User already registered': 'Este email já está cadastrado.',
  'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres.',
  'Unable to validate email address: invalid format': 'Formato de email inválido.',
  'For security purposes, you can only request this once every 60 seconds':
    'Aguarde 60 segundos antes de tentar novamente.',
}

function mapAuthError(message: string): string {
  return AUTH_ERROR_MAP[message] ?? 'Ocorreu um erro. Tente novamente.'
}
