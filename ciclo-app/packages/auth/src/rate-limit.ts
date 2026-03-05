/**
 * Simple in-memory rate limiter for auth endpoints.
 * Max 5 attempts per 15 minutes per IP (AC-10).
 *
 * For production with multiple instances, replace with Upstash Redis.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Check if the given identifier (IP) is rate limited.
 *
 * @param identifier - IP address or other unique identifier
 * @returns Object with { limited, remaining, resetAt }
 */
export function checkRateLimit(identifier: string): {
  limited: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const entry = store.get(identifier)

  // No entry or window expired: start fresh
  if (!entry || now > entry.resetAt) {
    store.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    })
    return { limited: false, remaining: MAX_ATTEMPTS - 1, resetAt: now + WINDOW_MS }
  }

  // Increment
  entry.count += 1

  if (entry.count > MAX_ATTEMPTS) {
    return { limited: true, remaining: 0, resetAt: entry.resetAt }
  }

  return { limited: false, remaining: MAX_ATTEMPTS - entry.count, resetAt: entry.resetAt }
}

/**
 * Get the client IP from request headers (works behind proxies).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown'
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}
