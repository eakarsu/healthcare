import fs from 'fs'
import path from 'path'
import mime from 'mime-types'
import { prisma } from '@/lib/prisma'
import {
  encryptAndSaveFile,
  readAndDecryptFile,
  generateSecureFilename,
  generateKeyId,
  verifyChecksum,
} from './encryption'
import type { DocumentUploadParams, DocumentMetadata, DocumentCategory } from './types'

const STORAGE_PATH = process.env.DOCUMENT_STORAGE_PATH || './uploads/documents'
const MAX_FILE_SIZE = parseInt(process.env.DOCUMENT_MAX_SIZE_MB || '50') * 1024 * 1024
const RETENTION_YEARS = parseInt(process.env.DOCUMENT_RETENTION_YEARS || '6')

/**
 * Upload and encrypt a document
 */
export async function uploadDocument(params: DocumentUploadParams): Promise<DocumentMetadata> {
  const {
    buffer,
    originalName,
    category,
    documentType,
    patientId,
    encounterId,
    claimId,
    accessLevel = 'PROVIDER',
    createdBy,
  } = params

  // Validate file size
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Determine MIME type
  const mimeType = mime.lookup(originalName) || 'application/octet-stream'

  // Generate secure filename and path
  const secureFilename = generateSecureFilename(originalName)
  const categoryPath = path.join(STORAGE_PATH, category.toLowerCase())
  const filePath = path.join(categoryPath, secureFilename)

  // Encrypt and save file
  const { iv, authTag, checksum } = await encryptAndSaveFile(buffer, filePath)

  // Calculate retention date (HIPAA minimum 6 years)
  const retentionDate = new Date()
  retentionDate.setFullYear(retentionDate.getFullYear() + RETENTION_YEARS)

  // Create database record
  const document = await prisma.encryptedDocument.create({
    data: {
      originalName,
      encryptedPath: filePath,
      encryptionKeyId: generateKeyId(),
      fileSize: buffer.length,
      mimeType,
      checksum,
      category,
      documentType,
      patientId,
      encounterId,
      claimId,
      accessLevel,
      retentionDate,
      createdBy,
    },
  })

  return {
    id: document.id,
    originalName: document.originalName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    category: document.category as DocumentCategory,
    documentType: document.documentType,
    createdAt: document.createdAt,
  }
}

/**
 * Download and decrypt a document
 */
export async function downloadDocument(
  documentId: string,
  userId: string
): Promise<{ buffer: Buffer; metadata: DocumentMetadata }> {
  // Get document metadata
  const document = await prisma.encryptedDocument.findUnique({
    where: { id: documentId },
  })

  if (!document) {
    throw new Error('Document not found')
  }

  if (document.deletedAt) {
    throw new Error('Document has been deleted')
  }

  // Check if file exists
  if (!fs.existsSync(document.encryptedPath)) {
    throw new Error('Document file not found on disk')
  }

  // Read and decrypt file
  const buffer = await readAndDecryptFile(document.encryptedPath)

  // Verify checksum
  if (!verifyChecksum(buffer, document.checksum)) {
    throw new Error('Document integrity check failed')
  }

  return {
    buffer,
    metadata: {
      id: document.id,
      originalName: document.originalName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
      category: document.category as DocumentCategory,
      documentType: document.documentType,
      createdAt: document.createdAt,
    },
  }
}

/**
 * Get document metadata without downloading
 */
export async function getDocumentMetadata(documentId: string): Promise<DocumentMetadata | null> {
  const document = await prisma.encryptedDocument.findUnique({
    where: { id: documentId },
  })

  if (!document || document.deletedAt) {
    return null
  }

  return {
    id: document.id,
    originalName: document.originalName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    category: document.category as DocumentCategory,
    documentType: document.documentType,
    createdAt: document.createdAt,
  }
}

/**
 * List documents for a patient
 */
export async function listPatientDocuments(
  patientId: string,
  options?: {
    category?: DocumentCategory
    limit?: number
    offset?: number
  }
): Promise<{ documents: DocumentMetadata[]; total: number }> {
  const { category, limit = 50, offset = 0 } = options || {}

  const where = {
    patientId,
    deletedAt: null,
    ...(category && { category }),
  }

  const [documents, total] = await Promise.all([
    prisma.encryptedDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.encryptedDocument.count({ where }),
  ])

  return {
    documents: documents.map((doc) => ({
      id: doc.id,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      fileSize: doc.fileSize,
      category: doc.category as DocumentCategory,
      documentType: doc.documentType,
      createdAt: doc.createdAt,
    })),
    total,
  }
}

/**
 * Soft delete a document
 */
export async function deleteDocument(documentId: string, userId: string): Promise<void> {
  await prisma.encryptedDocument.update({
    where: { id: documentId },
    data: { deletedAt: new Date() },
  })
}

/**
 * Permanently delete expired documents
 */
export async function purgeExpiredDocuments(): Promise<number> {
  const now = new Date()

  // Find documents past retention date and already soft-deleted
  const expiredDocs = await prisma.encryptedDocument.findMany({
    where: {
      OR: [
        { retentionDate: { lt: now }, deletedAt: { not: null } },
        // Only purge if deleted and past retention
      ],
    },
  })

  let purgedCount = 0

  for (const doc of expiredDocs) {
    try {
      // Delete file from disk
      if (fs.existsSync(doc.encryptedPath)) {
        await fs.promises.unlink(doc.encryptedPath)
      }

      // Delete database record
      await prisma.encryptedDocument.delete({
        where: { id: doc.id },
      })

      purgedCount++
    } catch (error) {
      console.error(`Failed to purge document ${doc.id}:`, error)
    }
  }

  return purgedCount
}

/**
 * Initialize storage directory
 */
export async function initializeStorage(): Promise<void> {
  const categories = ['clinical', 'billing', 'administrative', 'fax']

  for (const category of categories) {
    const categoryPath = path.join(STORAGE_PATH, category)
    await fs.promises.mkdir(categoryPath, { recursive: true })
  }
}
