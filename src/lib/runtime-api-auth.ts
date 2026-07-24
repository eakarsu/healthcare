import { createHmac, timingSafeEqual } from 'node:crypto'

type RuntimeToken = {
  sub: string
  exp: number
}

function secret(): string {
  const value = process.env.NEXTAUTH_SECRET
  if (!value || value.length < 32) throw new Error('NEXTAUTH_SECRET is not configured')
  return value
}

function signature(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function issueRuntimeToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 15 * 60 })).toString('base64url')
  return `${payload}.${signature(payload)}`
}

export function verifyRuntimeToken(header: string | null): RuntimeToken | null {
  if (!header?.startsWith('Bearer ')) return null
  const [payload, suppliedSignature] = header.slice(7).split('.')
  if (!payload || !suppliedSignature) return null
  const expectedSignature = signature(payload)
  const supplied = Buffer.from(suppliedSignature)
  const expected = Buffer.from(expectedSignature)
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as RuntimeToken
    if (!decoded.sub || !decoded.exp || decoded.exp <= Math.floor(Date.now() / 1000)) return null
    return decoded
  } catch {
    return null
  }
}
