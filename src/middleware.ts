import { NextRequest, NextResponse } from 'next/server'

// ============ RATE LIMITING ============
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 100 // max requests per window
const AUTH_RATE_LIMIT_MAX = 10 // stricter limit for auth endpoints
const AI_RATE_LIMIT_MAX = 20 // 20 req per hour for AI endpoints (per-user)
const AI_RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

// Separate map for AI endpoints with longer window
const aiRateLimitMap = new Map<string, { count: number; lastReset: number }>()

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

function checkAIRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = aiRateLimitMap.get(key)

  if (!entry || now - entry.lastReset > AI_RATE_LIMIT_WINDOW) {
    aiRateLimitMap.set(key, { count: 1, lastReset: now })
    return { allowed: true, remaining: AI_RATE_LIMIT_MAX - 1, resetIn: AI_RATE_LIMIT_WINDOW }
  }

  entry.count++
  if (entry.count > AI_RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: AI_RATE_LIMIT_WINDOW - (now - entry.lastReset) }
  }

  return { allowed: true, remaining: AI_RATE_LIMIT_MAX - entry.count, resetIn: AI_RATE_LIMIT_WINDOW - (now - entry.lastReset) }
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
    for (const [key, entry] of aiRateLimitMap.entries()) {
      if (now - entry.lastReset > AI_RATE_LIMIT_WINDOW * 2) {
        aiRateLimitMap.delete(key)
      }
    }
  }, RATE_LIMIT_WINDOW * 2)
}

// ============ SECURITY HEADERS (Helmet-style) ============
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
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

// ============ TENANT ISOLATION ============
// Extract practiceId / sub (userId) from JWT token in the session cookie
function extractTokenPayload(request: NextRequest): { practiceId: string | null; sub: string | null } {
  try {
    const sessionToken = request.cookies.get('next-auth.session-token')?.value
      || request.cookies.get('__Secure-next-auth.session-token')?.value

    if (!sessionToken) return { practiceId: null, sub: null }
    const parts = sessionToken.split('.')
    if (parts.length !== 3) return { practiceId: null, sub: null }

    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
    )
    return { practiceId: payload.practiceId || null, sub: payload.sub || payload.userId || null }
  } catch {
    return { practiceId: null, sub: null }
  }
}

function extractPracticeIdFromToken(request: NextRequest): string | null {
  return extractTokenPayload(request).practiceId
}

// ============ CORS ============
function getAllowedOrigins(): string[] {
  return (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function applyCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin')
  const allowed = getAllowedOrigins()
  let allowOrigin: string | null = null
  if (origin) {
    if (allowed.includes(origin)) allowOrigin = origin
  }
  if (allowOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowOrigin)
    response.headers.set('Vary', 'Origin')
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, X-Practice-Id'
  )
  response.headers.set('Access-Control-Allow-Credentials', allowOrigin ? 'true' : 'false')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

// ============ MIDDLEWARE ============
export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Determine endpoint type
    const isAuthEndpoint = pathname.startsWith('/api/auth/')
    // Credential submission needs the stricter brute-force limit. Read-only
    // session and identity checks are ordinary authenticated API traffic and
    // must remain usable immediately after login.
    const isCredentialSubmission = isAuthEndpoint
      && request.method !== 'GET'
      && /\/(?:login|callback|signin|register)$/.test(pathname)
    const isApiEndpoint = pathname.startsWith('/api/')
    const isAIEndpoint = pathname.startsWith('/api/ai/')
    const rateLimitKey = getRateLimitKey(request)

    // Only explicitly governed AI journeys are supported. Generated gap demos
    // and unreviewed clinical AI routes must not be exposed as production features.
    const isGeneratedGapPath = pathname.startsWith('/api/gap-no-')
      || pathname.startsWith('/dashboard/batch10')
    const governedAIPaths = new Set(['/api/ai/scribe', '/api/ai/runtime-readiness'])
    const isUngovernedAIPath = (isAIEndpoint && !governedAIPaths.has(pathname))
      || (pathname.startsWith('/dashboard/ai/') && pathname !== '/dashboard/ai/scribe')

    if (isGeneratedGapPath || isUngovernedAIPath) {
      const response = NextResponse.json(
        { error: 'This workflow is not enabled for production use.' },
        { status: 404 }
      )
      applyCors(request, response)
      return addSecurityHeaders(response)
    }

    // Handle CORS preflight first
    if (isApiEndpoint && request.method === 'OPTIONS') {
      const preflight = new NextResponse(null, { status: 204 })
      applyCors(request, preflight)
      return addSecurityHeaders(preflight)
    }

    // Apply stricter rate limiting to AI endpoints (20/hr per-user)
    if (isAIEndpoint) {
      const tokenPayload = extractTokenPayload(request)
      // Prefer user-scoped key when authenticated; fallback to IP
      const aiKey = tokenPayload.sub ? `user:${tokenPayload.sub}:ai` : `${rateLimitKey}:ai`
      const { allowed, remaining, resetIn } = checkAIRateLimit(aiKey)

      if (!allowed) {
        const response = new NextResponse(
          JSON.stringify({
            error: 'AI rate limit exceeded. Maximum 20 requests per hour.',
            retryAfter: Math.ceil(resetIn / 1000),
          }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
        response.headers.set('Retry-After', Math.ceil(resetIn / 1000).toString())
        response.headers.set('X-RateLimit-Limit', AI_RATE_LIMIT_MAX.toString())
        response.headers.set('X-RateLimit-Remaining', '0')
        response.headers.set('X-RateLimit-Window', '3600')
        applyCors(request, response)
        return addSecurityHeaders(response)
      }

      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', AI_RATE_LIMIT_MAX.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      if (tokenPayload.practiceId) {
        response.headers.set('X-Practice-Id', tokenPayload.practiceId)
      }
      applyCors(request, response)
      return addSecurityHeaders(response)
    }

    // Apply rate limiting to API routes
    if (isApiEndpoint) {
      const maxRequests = isCredentialSubmission ? AUTH_RATE_LIMIT_MAX : RATE_LIMIT_MAX
      const { allowed, remaining } = checkRateLimit(
        `${rateLimitKey}:${isCredentialSubmission ? 'auth-submit' : 'api'}`,
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

      // Inject practiceId for all API routes when authenticated
      const practiceId = extractPracticeIdFromToken(request)
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      if (practiceId) {
        response.headers.set('X-Practice-Id', practiceId)
      }
      applyCors(request, response)
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
