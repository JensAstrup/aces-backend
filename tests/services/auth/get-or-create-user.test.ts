import getOrCreateUser from '@aces/services/auth/get-or-create-user'
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
jest.mock('@aces/util/encryption/encrypt', () => jest.fn().mockReturnValue('abcdef'))
const mockEncrypt = encrypt as jest.Mock

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
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
    })
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
    expect(mockEncrypt).toHaveBeenCalledWith('token-123456')
  })
})
