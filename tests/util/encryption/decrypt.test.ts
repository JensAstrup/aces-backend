import crypto from 'crypto'

import decrypt from '@aces/util/encryption/decrypt'



process.env.ENCRYPTION_KEY = 'test_key'

jest.mock('crypto', () => {
  const originalModule = jest.requireActual('crypto')
  const SIZE = 32
  return {
    ...originalModule,
    scryptSync: jest.fn().mockReturnValue(Buffer.alloc(SIZE, 'a')),
    createDecipheriv: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue('test data'),
      final: jest.fn().mockReturnValue(''),
    }),
  }
})

describe('decrypt', () => {
  it('should return the original data when given a valid encrypted string', () => {
    const encryptedData = '8a8a8a8a8a8a8a8a8a8a8a8a8a8a8a8a:encrypted_data'
    const decrypted = decrypt(encryptedData)
    expect(decrypted).toBe('test data')
  })

  it('should throw an error if the encrypted string is invalid', () => {
    const invalidData = 'invalid data'
    expect(() => decrypt(invalidData)).toThrow()
  })

  it('should use AES-256-CBC for decryption', () => {
    const createDecipherivSpy = jest.spyOn(crypto, 'createDecipheriv')
    const encryptedData = '8a8a8a8a8a8a8a8a8a8a8a8a8a8a8a8a:encrypted_data'
    decrypt(encryptedData)
    expect(createDecipherivSpy).toHaveBeenCalledWith(
      'aes-256-cbc',
      Buffer.alloc(32, 'a'),
      Buffer.from('8a8a8a8a8a8a8a8a8a8a8a8a8a8a8a8a', 'hex')
    )
  })
})
