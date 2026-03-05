// NextAuth.js v5 exports
export { auth, handlers, signIn, signOut } from './auth'
export { authConfig } from './auth.config'

// RBAC
export { hasPermission, getRoleLevel, ROLES_ASC } from './rbac'

// Guards (Server Actions / API routes)
export { requireAuth, requireRole } from './guards'

// Rate limiting
export { checkRateLimit, getClientIp } from './rate-limit'

// CPF crypto (LGPD - AC-11)
export { encryptCpf, decryptCpf } from './crypto'

// Type augmentations (side-effect import)
export type {} from './types'
