import type { UserRole } from '@ciclo/database'
import { auth } from './auth'
import { hasPermission } from './rbac'

/**
 * Get the current authenticated session, throwing if not authenticated.
 * Use in Server Actions and API route handlers.
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Nao autorizado. Faca login para continuar.')
  }

  return session
}

/**
 * Require the user to have at minimum the specified role.
 * Throws if not authenticated or insufficient permissions.
 *
 * @param requiredRole - Minimum role required (uses hierarchy)
 */
export async function requireRole(requiredRole: UserRole) {
  const session = await requireAuth()

  if (!hasPermission(session.user.role, requiredRole)) {
    throw new Error(
      `Acesso negado. Requer permissao de nivel ${requiredRole} ou superior.`
    )
  }

  return session
}
