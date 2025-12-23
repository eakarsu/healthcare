export type DocumentCategory = 'CLINICAL' | 'BILLING' | 'ADMINISTRATIVE' | 'FAX'

export type AccessLevel = 'PROVIDER' | 'STAFF' | 'BILLING' | 'ADMIN'

export interface DocumentUploadParams {
  buffer: Buffer
  originalName: string
  category: DocumentCategory
  documentType: string
  patientId?: string
  encounterId?: string
  claimId?: string
  faxMessageId?: string
  accessLevel?: AccessLevel
  createdBy: string
}

export interface DocumentMetadata {
  id: string
  originalName: string
  mimeType: string
  fileSize: number
  category: DocumentCategory
  documentType: string
  createdAt: Date
}

export interface DocumentDownloadResult {
  buffer: Buffer
  metadata: DocumentMetadata
}

export interface DocumentListResult {
  documents: DocumentMetadata[]
  total: number
}
