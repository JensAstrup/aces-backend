import { createCipheriv, randomBytes, scryptSync } from 'crypto'

import ConfigurationError from '@aces/errors/configuration-error'




function encrypt(data: string): string {
  const KEY = process.env.ENCRYPTION_KEY
  const IV_LENGTH = 16

  if (KEY === undefined) {
    throw new ConfigurationError('ENCRYPTION_KEY is required')
  }

  // Derive a key using scrypt with a salt
  const KEY_LENGTH = 32
  const key = scryptSync(KEY, 'salt', KEY_LENGTH)

  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

export default encrypt
