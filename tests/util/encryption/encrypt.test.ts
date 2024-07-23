import { createCipheriv } from 'crypto'

import { encrypt } from '@dotenvx/dotenvx'

import ConfigurationError from '@aces/errors/configuration-error'


// Mock the environment variable
process.env.ENCRYPTION_KEY = 'test_key'

// Mock scryptSync to return a predictable key
jest.mock('crypto', () => {
  const originalModule = jest.requireActual('crypto')
  return {
    ...originalModule,
    scryptSync: jest.fn().mockReturnValue(Buffer.alloc(32, 'a')),
  }
})

jest.mock('createCipheriv')
const mockCreateCipheriv = createCipheriv as jest.Mock

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
    encrypt('test data')
    expect(mockCreateCipheriv).toHaveBeenCalledWith(
      'aes-256-cbc',
      Buffer.alloc(32, 'a'),
      expect.any(Buffer)
    )
  })
})
