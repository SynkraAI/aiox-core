import { NextResponse } from 'next/server'
import type { NextRequest, NextMiddleware } from 'next/server'
import { auth } from '@ciclo/auth'

/**
 * Route protection rules for apps/web (AC-5).
 *
 * Public routes: /, /evento/*, /login, /register, /forgot-password, /reset-password
 * Protected routes:
 *   /profile/* -> USER+
 *   /inscrição/* -> USER+
 *   /therapist/* -> THERAPIST+
 *   /facilitator/* -> FACILITATOR+
 *   /admin/* -> ADMIN only
 */

const ROLE_HIERARCHY: Record<string, number> = {
  USER: 1,
  THERAPIST: 2,
  FACILITATOR: 3,
  ADMIN: 4,
}

/** Routes that require no authentication */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
]

/** Prefix-based public routes */
const PUBLIC_PREFIXES = [
  '/evento',
  '/api/auth',
]

/** Protected route prefixes and their minimum required role */
const PROTECTED_ROUTES: Array<{ prefix: string; minRole: string }> = [
  { prefix: '/admin', minRole: 'ADMIN' },
  { prefix: '/facilitator', minRole: 'FACILITATOR' },
  { prefix: '/therapist', minRole: 'THERAPIST' },
  { prefix: '/profile', minRole: 'USER' },
  { prefix: '/inscrição', minRole: 'USER' },
]

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function getRequiredRole(pathname: string): string | null {
  for (const route of PROTECTED_ROUTES) {
    if (pathname.startsWith(route.prefix)) {
      return route.minRole
    }
  }
  return null
}

const middleware = auth((req) => {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    // Redirect authenticated users away from auth pages
    if (req.auth && ['/login', '/register'].includes(pathname)) {
      return NextResponse.redirect(new URL('/profile', req.url))
    }
    return NextResponse.next()
  }

  // Check if route requires specific role
  const requiredRole = getRequiredRole(pathname)

  if (!requiredRole) {
    // Not a specifically protected route, allow
    return NextResponse.next()
  }

  // Not authenticated -> redirect to login
  if (!req.auth) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role hierarchy
  const userRole = (req.auth.user as { role?: string })?.role ?? 'USER'
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0

  if (userLevel < requiredLevel) {
    // Insufficient permissions -> redirect to home
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default middleware as any

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
