import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase.client'
import { purchasesLogIn, purchasesLogOut } from '../services/purchases.service'

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
    supabase.auth.getSession()
      .then(({ data }) => set({ session: data.session, isLoading: false }))
      .catch(() => set({ isLoading: false }))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, isLoading: false })
    })

    return () => subscription.unsubscribe()
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return mapAuthError(error.message)
      if (data.user) purchasesLogIn(data.user.id).catch(() => {})
      return null
    } catch {
      return 'Erro de conexão. Verifique sua internet e tente novamente.'
    } finally {
      set({ isLoading: false })
    }
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const { error, data } = await supabase.auth.signUp({ email, password })
      if (error) return mapAuthError(error.message)
      if (data.user) purchasesLogIn(data.user.id).catch(() => {})
      return null
    } catch {
      return 'Erro de conexão. Verifique sua internet e tente novamente.'
    } finally {
      set({ isLoading: false })
    }
  },

  signOut: async () => {
    await purchasesLogOut().catch(() => {})
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
  'Signups not allowed for this instance': 'Cadastro temporariamente desabilitado.',
  'signup_disabled': 'Cadastro temporariamente desabilitado.',
  'Anonymous sign-ins are disabled': 'Cadastro temporariamente desabilitado.',
}

function mapAuthError(message: string): string {
  // Tenta match exato, depois parcial, depois retorna o erro original para diagnóstico
  if (AUTH_ERROR_MAP[message]) return AUTH_ERROR_MAP[message]
  const partialKey = Object.keys(AUTH_ERROR_MAP).find((k) => message.includes(k))
  if (partialKey) return AUTH_ERROR_MAP[partialKey]
  return message // mostra o erro real do Supabase em vez de mensagem genérica
}
