export type ConciergeFormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  errors?: Partial<Record<'name' | 'email' | 'message', string>>
}

export const INITIAL_CONCIERGE_STATE: ConciergeFormState = { status: 'idle' }
