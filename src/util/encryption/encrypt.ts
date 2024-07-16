import { AES } from 'crypto-js'

import ConfigurationError from '@aces/errors/configuration-error'


const KEY = process.env.ENCRYPTION_KEY

if (KEY === undefined) {
  throw new ConfigurationError('ENCRYPTION_KEY is required')
}

function encrypt(data: string): string {
  return AES.encrypt(data, KEY!).toString()
}

export default encrypt
