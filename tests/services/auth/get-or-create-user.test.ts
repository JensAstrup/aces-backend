import { User as LinearUser } from '@linear/sdk'
import { PrismaClient, User } from '@prisma/client'

import getUser, { createUser } from '@aces/services/auth/get-or-create-user'
import getLinearUser from '@aces/services/auth/linear-user'
import decrypt from '@aces/util/encryption/decrypt'
import encrypt from '@aces/util/encryption/encrypt'


jest.mock('@aces/services/auth/linear-user')
jest.mock('@aces/util/encryption/decrypt')
jest.mock('@aces/util/encryption/encrypt')

const mockGetLinearUser = getLinearUser as jest.MockedFunction<typeof getLinearUser>
const mockDecrypt = decrypt as jest.MockedFunction<typeof decrypt>
const mockEncrypt = encrypt as jest.MockedFunction<typeof encrypt>

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      upsert: jest.fn(),
      findUniqueOrThrow: jest.fn()
    }
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  }
})

describe('User Service', () => {
  let mockPrismaClient: {
    user: {
      upsert: jest.Mock
      findUniqueOrThrow: jest.Mock
    }
  }

  const mockLinearUser: LinearUser = {
    id: 'linear-123456',
    email: 'test@email.com',
    displayName: 'Test User'
  } as LinearUser

  const mockPrismaUser: User = {
    id: '123456',
    linearId: 'linear-123456',
    email: 'test@email.com',
    displayName: 'Test User',
    token: 'access-token-123456'
  } as User

  beforeEach(() => {
    mockPrismaClient = new PrismaClient() as unknown as {
      user: {
        upsert: jest.Mock
        findUniqueOrThrow: jest.Mock
      }
    }
    jest.clearAllMocks()
    mockGetLinearUser.mockResolvedValue(mockLinearUser)
    mockDecrypt.mockImplementation(token => `decrypted-${token}`)
    mockEncrypt.mockImplementation(token => `encrypted-${token}`)
    mockPrismaClient.user.upsert.mockResolvedValue(mockPrismaUser)
    mockPrismaClient.user.findUniqueOrThrow.mockResolvedValue(mockPrismaUser)
  })

  describe('getUser', () => {
    it('should return a user for a valid Linear access token', async () => {
      const user = await getUser('access-token-123456')
      expect(user).toEqual(mockPrismaUser)
      expect(mockGetLinearUser).toHaveBeenCalledWith('decrypted-access-token-123456')
      expect(mockPrismaClient.user.upsert).toHaveBeenCalledWith({
        where: { linearId: 'linear-123456' },
        update: {
          email: 'test@email.com',
          displayName: 'Test User',
          token: 'access-token-123456',
        },
        create: {
          email: 'test@email.com',
          displayName: 'Test User',
          linearId: 'linear-123456',
          token: 'access-token-123456',
        },
      })
    })

    it('should handle encrypted Linear access token', async () => {
      const user = await getUser('encrypted-token-123456')
      expect(user).toEqual(mockPrismaUser)
      expect(mockDecrypt).toHaveBeenCalledWith('encrypted-token-123456')
      expect(mockGetLinearUser).toHaveBeenCalledWith('decrypted-encrypted-token-123456')
    })

    it('should return an anonymous user', async () => {
      mockDecrypt.mockReturnValueOnce('anonymous-123456')
      const anonymousUser = await getUser('encrypted-anonymous-123456')
      expect(anonymousUser).toEqual(mockPrismaUser)
      expect(mockPrismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: {
          token: 'encrypted-anonymous-123456',
        }
      })
      expect(mockGetLinearUser).not.toHaveBeenCalled()
    })

    it('should throw an error if anonymous user is not found', async () => {
      mockDecrypt.mockReturnValueOnce('anonymous-123456')
      mockPrismaClient.user.findUniqueOrThrow.mockRejectedValue(new Error('User not found'))
      await expect(getUser('encrypted-anonymous-123456')).rejects.toThrow('User not found')
    })
  })

  describe('createUser', () => {
    it('should create a new user with an encrypted token', async () => {
      const user = await createUser('plain-token-123456')
      expect(user).toEqual(mockPrismaUser)
      expect(mockEncrypt).toHaveBeenCalledWith('plain-token-123456')
      expect(mockGetLinearUser).toHaveBeenCalledWith('decrypted-encrypted-plain-token-123456')
      expect(mockPrismaClient.user.upsert).toHaveBeenCalledWith({
        where: { linearId: 'linear-123456' },
        update: {
          email: 'test@email.com',
          displayName: 'Test User',
          token: 'encrypted-plain-token-123456',
        },
        create: {
          email: 'test@email.com',
          displayName: 'Test User',
          linearId: 'linear-123456',
          token: 'encrypted-plain-token-123456',
        },
      })
    })
  })
})
