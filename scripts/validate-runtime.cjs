#!/usr/bin/env node
'use strict'

const { loadEnvConfig } = require('@next/env')

loadEnvConfig(process.cwd(), false)

const failures = []
const localAcceptance = process.env.NODE_ENV !== 'production' && process.env.BOOTSTRAP_ACKNOWLEDGEMENT === 'create-initial-admin'
const origins = (process.env.CORS_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean)
const fhirHosts = (process.env.FHIR_ALLOWED_HOSTS || '').split(',').map(value => value.trim()).filter(Boolean)
const encryptionKey = process.env.ENCRYPTION_KEY || ''

if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32 || process.env.NEXTAUTH_SECRET.includes('your-secret')) failures.push('NEXTAUTH_SECRET')
if (!process.env.NEXTAUTH_URL?.startsWith(localAcceptance ? 'http://' : 'https://')) failures.push(`NEXTAUTH_URL (${localAcceptance ? 'HTTP acceptance URL' : 'HTTPS'} required)`)
if (!process.env.DATABASE_URL?.startsWith('postgresql://') || (!localAcceptance && /(?:password|localhost)/i.test(process.env.DATABASE_URL))) failures.push('DATABASE_URL (external PostgreSQL required)')
if (Buffer.from(encryptionKey, 'base64').length !== 32 || encryptionKey.includes('your-')) failures.push('ENCRYPTION_KEY (32 random bytes in base64 required)')
if (!origins.length || origins.includes('*') || origins.some(origin => !origin.startsWith(localAcceptance ? 'http://' : 'https://'))) failures.push(`CORS_ALLOWED_ORIGINS (explicit ${localAcceptance ? 'HTTP acceptance' : 'HTTPS'} origins required)`)
if (!fhirHosts.length || fhirHosts.some(host => host.includes('://') || host === '*' || /localhost/i.test(host))) failures.push('FHIR_ALLOWED_HOSTS (explicit external hostnames required)')

if (failures.length) {
  console.error(`Refusing production startup; invalid configuration: ${failures.join(', ')}`)
  process.exit(1)
}
