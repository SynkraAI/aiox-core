import { renderHook, act } from '@testing-library/react-native'

jest.mock('../../src/services/supabase.client', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}))

import { useAuthStore } from '../../src/stores/auth.store'
import { supabase } from '../../src/services/supabase.client'

const mockAuth = supabase.auth as jest.Mocked<typeof supabase.auth>

describe('auth.store', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset store state
    useAuthStore.setState({ session: null, isLoading: true })
  })

  describe('initialize', () => {
    it('carrega sessão existente e atualiza estado', async () => {
      const fakeSession = { user: { id: 'u1' } } as never
      mockAuth.getSession.mockResolvedValue({ data: { session: fakeSession }, error: null })

      const { result } = renderHook(() => useAuthStore())
      await act(async () => { result.current.initialize() })

      expect(result.current.session).toEqual(fakeSession)
      expect(result.current.isLoading).toBe(false)
    })

    it('retorna função de cleanup que chama unsubscribe', async () => {
      const unsubscribeMock = jest.fn()
      mockAuth.getSession.mockResolvedValue({ data: { session: null }, error: null })
      mockAuth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: unsubscribeMock } },
      } as never)

      const { result } = renderHook(() => useAuthStore())
      let cleanup: (() => void) | undefined
      await act(async () => { cleanup = result.current.initialize() })

      cleanup?.()
      expect(unsubscribeMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('signIn', () => {
    it('retorna null em caso de sucesso', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({ data: {} as never, error: null })

      const { result } = renderHook(() => useAuthStore())
      let error: string | null = 'pending'
      await act(async () => { error = await result.current.signIn('a@b.com', 'senha123') })

      expect(error).toBeNull()
    })

    it('retorna mensagem amigável em caso de erro', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: {} as never,
        error: { message: 'Invalid login credentials' } as never,
      })

      const { result } = renderHook(() => useAuthStore())
      let error: string | null = null
      await act(async () => { error = await result.current.signIn('a@b.com', 'errada') })

      expect(error).toBe('Email ou senha incorretos.')
    })

    it('retorna mensagem genérica para erros desconhecidos', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: {} as never,
        error: { message: 'some unknown error' } as never,
      })

      const { result } = renderHook(() => useAuthStore())
      let error: string | null = null
      await act(async () => { error = await result.current.signIn('a@b.com', 'senha') })

      expect(error).toBe('Ocorreu um erro. Tente novamente.')
    })
  })

  describe('signUp', () => {
    it('retorna null em caso de sucesso', async () => {
      mockAuth.signUp.mockResolvedValue({ data: {} as never, error: null })

      const { result } = renderHook(() => useAuthStore())
      let error: string | null = 'pending'
      await act(async () => { error = await result.current.signUp('new@b.com', 'senha123') })

      expect(error).toBeNull()
      expect(mockAuth.signUp).toHaveBeenCalledWith({ email: 'new@b.com', password: 'senha123' })
    })

    it('retorna mensagem amigável quando email já cadastrado', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: {} as never,
        error: { message: 'User already registered' } as never,
      })

      const { result } = renderHook(() => useAuthStore())
      let error: string | null = null
      await act(async () => { error = await result.current.signUp('existing@b.com', 'senha123') })

      expect(error).toBe('Este email já está cadastrado.')
    })
  })

  describe('signOut', () => {
    it('chama supabase.auth.signOut e limpa a sessão', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null })
      useAuthStore.setState({ session: { user: { id: 'u1' } } as never })

      const { result } = renderHook(() => useAuthStore())
      await act(async () => { await result.current.signOut() })

      expect(mockAuth.signOut).toHaveBeenCalledTimes(1)
      expect(result.current.session).toBeNull()
    })
  })
})
