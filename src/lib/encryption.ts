import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY is not set in environment variables')
  }
  const decoded = Buffer.from(key, 'base64')
  if (decoded.length !== 32 || decoded.toString('base64') !== key) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 random bytes encoded as base64')
  }
  return decoded
}

export function encrypt(text: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Combine IV + Auth Tag + Encrypted data
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey()

  const parts = encryptedText.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format')
  }

  const iv = Buffer.from(parts[0], 'hex')
  const authTag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

// Generate a new encryption key (for setup)
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('base64')
}

// Hash PHI for searching (one-way)
export function hashForSearch(text: string): string {
  return crypto
    .createHash('sha256')
    .update(text.toLowerCase().trim())
    .digest('hex')
}

// Encrypt sensitive fields in an object
export function encryptFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result = { ...data }
  for (const field of fields) {
    const value = result[field]
    if (typeof value === 'string' && value.length > 0) {
      result[field] = encrypt(value) as T[keyof T]
    }
  }
  return result
}

// Decrypt sensitive fields in an object
export function decryptFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result = { ...data }
  for (const field of fields) {
    const value = result[field]
    if (typeof value === 'string' && value.includes(':')) {
      try {
        result[field] = decrypt(value) as T[keyof T]
      } catch {
        // Field may not be encrypted, leave as is
      }
    }
  }
  return result
}
