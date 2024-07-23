import { createCipheriv, randomBytes, scryptSync } from 'crypto'

import ConfigurationError from '@aces/errors/configuration-error'


const KEY = process.env.ENCRYPTION_KEY
const IV_LENGTH = 16

if (KEY === undefined) {
  throw new ConfigurationError('ENCRYPTION_KEY is required')
}

// Derive a key using scrypt with a salt
const key = scryptSync(KEY, 'salt', 32)

function encrypt(data: string): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return `${iv.toString('hex')}:${encrypted}`
}

export default encrypt
