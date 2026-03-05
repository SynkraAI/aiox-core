import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16

function getEncryptionKey(): Buffer {
  const key = process.env.CPF_ENCRYPTION_KEY
  if (!key) {
    throw new Error('CPF_ENCRYPTION_KEY nao configurada. Gere com: openssl rand -hex 32')
  }
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt a CPF string using AES-256-GCM.
 * Returns a string in format: iv:encrypted:authTag (all hex).
 * NEVER log the plaintext CPF (LGPD compliance).
 */
export function encryptCpf(cpf: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(cpf, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`
}

/**
 * Decrypt a CPF string from AES-256-GCM format.
 * Input format: iv:encrypted:authTag (all hex).
 */
export function decryptCpf(encryptedCpf: string): string {
  const key = getEncryptionKey()
  const [ivHex, encryptedHex, authTagHex] = encryptedCpf.split(':')

  if (!ivHex || !encryptedHex || !authTagHex) {
    throw new Error('Formato de CPF criptografado invalido.')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
