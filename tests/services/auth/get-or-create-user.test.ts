import getOrCreateUser from '@aces/services/auth/get-or-create-user'
import decrypt from '@aces/util/encryption/decrypt'
import encrypt from '@aces/util/encryption/encrypt'


jest.mock('@aces/services/auth/linear-user', () => {
  const user = {
    id: '123456',
    linearId: 'linear-123456',
    email: 'test@email.com',
    displayName: 'Test User'
  }
  return jest.fn().mockResolvedValue(user)
})
jest.mock('@aces/util/encryption/decrypt', () => jest.fn().mockReturnValue('abcdef'))
const mockDecrypt = decrypt as jest.Mock

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      upsert: jest.fn().mockResolvedValue({
        id: '123456',
        linearId: 'linear-123456',
        email: 'test@email.com',
        displayName: 'Test User',
        token: 'abcdef'
      })
    }
  }

  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
    User: jest.fn() // Mocking the User type
  }
})

describe('getOrCreateUser', () => {
  it('should return a user', async () => {
    const user = await getOrCreateUser('token-123456')
    expect(user).toEqual({
      id: '123456',
      email: 'test@email.com',
      displayName: 'Test User',
      linearId: 'linear-123456',
      token: 'abcdef'
    })
    expect(mockDecrypt).toHaveBeenCalledWith('token-123456')
  })
})
