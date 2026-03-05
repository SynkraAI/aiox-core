import type { UserRole } from '@ciclo/database'

/**
 * Role hierarchy: ADMIN > FACILITATOR > THERAPIST > USER
 * VISITOR is not a stored role — it represents unauthenticated users.
 */
const ROLE_HIERARCHY: Record<string, number> = {
  USER: 1,
  THERAPIST: 2,
  FACILITATOR: 3,
  ADMIN: 4,
} as const

/**
 * Check if a user role meets or exceeds the required role level.
 * Uses cascading hierarchy: ADMIN inherits FACILITATOR inherits THERAPIST inherits USER.
 *
 * @param userRole - The role of the authenticated user
 * @param requiredRole - The minimum role required for access
 * @returns true if userRole >= requiredRole in hierarchy
 */
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0
  return userLevel >= requiredLevel
}

/**
 * Get the numeric hierarchy level for a role.
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role] ?? 0
}

/**
 * All stored roles in ascending order of authority.
 */
export const ROLES_ASC: UserRole[] = ['USER', 'THERAPIST', 'FACILITATOR', 'ADMIN'] as UserRole[]
