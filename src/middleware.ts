import { NextRequest, NextResponse } from 'next/server'

// ============ RATE LIMITING ============
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 100 // max requests per window
const AUTH_RATE_LIMIT_MAX = 10 // stricter limit for auth endpoints

function getRateLimitKey(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  return ip
}

function checkRateLimit(key: string, maxRequests: number): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, lastReset: now })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  entry.count++
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: maxRequests - entry.count }
}

// Clean up old entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now - entry.lastReset > RATE_LIMIT_WINDOW * 2) {
        rateLimitMap.delete(key)
      }
    }
  }, RATE_LIMIT_WINDOW * 2)
}

// ============ SECURITY HEADERS (Helmet-style) ============
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  )

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // Enable XSS filter
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions policy (Feature Policy successor)
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(self), geolocation=(), interest-cohort=()'
  )

  // Strict Transport Security
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )

  // Prevent DNS prefetching
  response.headers.set('X-DNS-Prefetch-Control', 'off')

  // Download options
  response.headers.set('X-Download-Options', 'noopen')

  // Permitted cross-domain policies
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  return response
}

// ============ GLOBAL ERROR HANDLER ============
function handleError(error: unknown): NextResponse {
  console.error('Middleware error:', error)

  const message = error instanceof Error ? error.message : 'Internal Server Error'

  return new NextResponse(
    JSON.stringify({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? message : 'An unexpected error occurred',
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

// ============ MIDDLEWARE ============
export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Determine rate limit based on endpoint type
    const isAuthEndpoint = pathname.startsWith('/api/auth/')
    const isApiEndpoint = pathname.startsWith('/api/')
    const rateLimitKey = getRateLimitKey(request)

    // Apply rate limiting to API routes
    if (isApiEndpoint) {
      const maxRequests = isAuthEndpoint ? AUTH_RATE_LIMIT_MAX : RATE_LIMIT_MAX
      const { allowed, remaining } = checkRateLimit(
        `${rateLimitKey}:${isAuthEndpoint ? 'auth' : 'api'}`,
        maxRequests
      )

      if (!allowed) {
        const response = new NextResponse(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          }
        )
        response.headers.set('Retry-After', '60')
        response.headers.set('X-RateLimit-Limit', maxRequests.toString())
        response.headers.set('X-RateLimit-Remaining', '0')
        return addSecurityHeaders(response)
      }

      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      return addSecurityHeaders(response)
    }

    // Apply security headers to all responses
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  } catch (error) {
    return handleError(error)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
