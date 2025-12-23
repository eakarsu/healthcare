import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const KEY_LENGTH = 32

/**
 * Get the document encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.DOCUMENT_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('DOCUMENT_ENCRYPTION_KEY or ENCRYPTION_KEY is not set')
  }

  // If key is base64 encoded
  const keyBuffer = Buffer.from(key, 'base64')
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes (got ${keyBuffer.length})`)
  }

  return keyBuffer
}

/**
 * Generate a unique encryption key ID for tracking
 */
export function generateKeyId(): string {
  return `key-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
}

/**
 * Encrypt a file buffer
 */
export function encryptBuffer(buffer: Buffer): {
  encrypted: Buffer
  iv: string
  authTag: string
} {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
  const authTag = cipher.getAuthTag()

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  }
}

/**
 * Decrypt a file buffer
 */
export function decryptBuffer(
  encrypted: Buffer,
  ivHex: string,
  authTagHex: string
): Buffer {
  const key = getEncryptionKey()
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()])
}

/**
 * Encrypt and save a file to disk
 */
export async function encryptAndSaveFile(
  buffer: Buffer,
  outputPath: string
): Promise<{ iv: string; authTag: string; checksum: string }> {
  const { encrypted, iv, authTag } = encryptBuffer(buffer)

  // Calculate checksum of original file
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex')

  // Ensure directory exists
  const dir = path.dirname(outputPath)
  await fs.promises.mkdir(dir, { recursive: true })

  // Write encrypted file with metadata header
  const header = Buffer.from(JSON.stringify({ iv, authTag, checksum }))
  const headerLength = Buffer.alloc(4)
  headerLength.writeUInt32BE(header.length, 0)

  const fileContent = Buffer.concat([headerLength, header, encrypted])
  await fs.promises.writeFile(outputPath, fileContent)

  return { iv, authTag, checksum }
}

/**
 * Read and decrypt a file from disk
 */
export async function readAndDecryptFile(filePath: string): Promise<Buffer> {
  const fileContent = await fs.promises.readFile(filePath)

  // Read header length
  const headerLength = fileContent.readUInt32BE(0)

  // Parse header
  const header = JSON.parse(fileContent.subarray(4, 4 + headerLength).toString())
  const { iv, authTag } = header

  // Extract encrypted content
  const encrypted = fileContent.subarray(4 + headerLength)

  // Decrypt
  return decryptBuffer(encrypted, iv, authTag)
}

/**
 * Verify file integrity using checksum
 */
export function verifyChecksum(buffer: Buffer, expectedChecksum: string): boolean {
  const actualChecksum = crypto.createHash('sha256').update(buffer).digest('hex')
  return actualChecksum === expectedChecksum
}

/**
 * Generate a secure random filename
 */
export function generateSecureFilename(originalName: string): string {
  const ext = path.extname(originalName)
  const randomPart = crypto.randomBytes(16).toString('hex')
  const timestamp = Date.now()
  return `${timestamp}-${randomPart}${ext}`
}
