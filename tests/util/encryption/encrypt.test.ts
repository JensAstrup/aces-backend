import crypto from 'crypto'

import ConfigurationError from '@aces/errors/configuration-error'
import encrypt from '@aces/util/encryption/encrypt'



process.env.ENCRYPTION_KEY = 'test_key'

jest.mock('crypto', () => {
  const originalModule = jest.requireActual('crypto')
  return {
    ...originalModule,
    scryptSync: jest.fn().mockReturnValue(Buffer.alloc(32, 'a')),
    randomBytes: jest.fn().mockReturnValue(Buffer.alloc(16, 'b')),
    createCipheriv: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue('62626262626262626262626262626262'),
      final: jest.fn().mockReturnValue(''),
    }),
  }
})

describe('encrypt', () => {
  it('should throw ConfigurationError if ENCRYPTION_KEY is undefined', () => {
    delete process.env.ENCRYPTION_KEY
    expect(() => encrypt('data')).toThrow(ConfigurationError)
    process.env.ENCRYPTION_KEY = 'test_key'
  })

  it('should return an encrypted string', () => {
    const data = 'test data'
    const encrypted = encrypt(data)
    expect(typeof encrypted).toBe('string')
    expect(encrypted).toMatch(/^[0-9a-fA-F]+:[0-9a-fA-F]+$/)
  })

  it('should use AES-256-CBC for encryption', () => {
    const createCipherivSpy = jest.spyOn(crypto, 'createCipheriv')
    encrypt('test data')
    expect(createCipherivSpy).toHaveBeenCalledWith(
      'aes-256-cbc',
      Buffer.alloc(32, 'a'),
      Buffer.alloc(16, 'b')
    )
  })
})
