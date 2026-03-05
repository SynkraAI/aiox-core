import type { UserRole } from '@ciclo/database'
import type { DefaultSession } from 'next-auth'

/**
 * Extend the NextAuth session types to include role.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    role?: UserRole
  }

  // JWT type is extended within the 'next-auth' module in v5
  interface JWT {
    id?: string
    role?: UserRole
    isActive?: boolean
  }
}
