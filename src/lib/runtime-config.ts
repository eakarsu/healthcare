export function validateRuntimeConfig(env = process.env) {
  const failures: string[] = []
  if (!env.NEXTAUTH_SECRET || env.NEXTAUTH_SECRET.length < 32 || env.NEXTAUTH_SECRET.includes('your-secret')) failures.push('NEXTAUTH_SECRET must be a non-placeholder value of at least 32 characters')
  if (!env.DATABASE_URL?.startsWith('postgresql://') || /(?:password|localhost)/i.test(env.DATABASE_URL)) failures.push('DATABASE_URL must identify an external PostgreSQL service without placeholder credentials')
  try {
    if (!env.ENCRYPTION_KEY || Buffer.from(env.ENCRYPTION_KEY, 'base64').length !== 32 || env.ENCRYPTION_KEY.includes('your-')) throw new Error('invalid')
  } catch {
    failures.push('ENCRYPTION_KEY must encode exactly 32 non-placeholder bytes')
  }
  const origins = (env.CORS_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean)
  const fhirHosts = (env.FHIR_ALLOWED_HOSTS || '').split(',').map(value => value.trim()).filter(Boolean)
  if (!origins.length || origins.includes('*')) failures.push('CORS_ALLOWED_ORIGINS must list explicit origins')
  if (!fhirHosts.length || fhirHosts.some(host => host.includes('://') || host === '*' || /localhost/i.test(host))) failures.push('FHIR_ALLOWED_HOSTS must list explicit external hostnames')
  if (env.NODE_ENV === 'production') {
    if (!env.NEXTAUTH_URL?.startsWith('https://')) failures.push('NEXTAUTH_URL must use HTTPS in production')
    if (origins.some(origin => !origin.startsWith('https://'))) failures.push('Production CORS origins must use HTTPS')
  }
  if (failures.length) throw new Error(`Invalid runtime configuration: ${failures.join('; ')}`)
}
