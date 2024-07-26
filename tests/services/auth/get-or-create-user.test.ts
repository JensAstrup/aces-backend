import { User as LinearUser } from '@linear/sdk'
import { PrismaClient, User } from '@prisma/client'

import getOrCreateUser from '@aces/services/auth/get-or-create-user'
import getLinearUser from '@aces/services/auth/linear-user'
import decrypt from '@aces/util/encryption/decrypt'


jest.mock('@aces/services/auth/linear-user')
jest.mock('@aces/util/encryption/decrypt')

const mockGetLinearUser = getLinearUser as jest.MockedFunction<typeof getLinearUser>
const mockDecrypt = decrypt as jest.MockedFunction<typeof decrypt>

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

describe('getOrCreateUser', () => {
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
    mockPrismaClient.user.upsert.mockResolvedValue(mockPrismaUser)
    mockPrismaClient.user.findUniqueOrThrow.mockResolvedValue(mockPrismaUser)
  })

  it('should return a user for a valid Linear access token', async () => {
    const user = await getOrCreateUser('access-token-123456')
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
    const user = await getOrCreateUser('encrypted-token-123456', true)
    expect(user).toEqual(mockPrismaUser)
    expect(mockDecrypt).toHaveBeenCalledWith('encrypted-token-123456')
    expect(mockGetLinearUser).toHaveBeenCalledWith('decrypted-encrypted-token-123456')
  })

  it('should return an anonymous user', async () => {
    const anonymousUser = await getOrCreateUser('anonymous-123456')
    expect(anonymousUser).toEqual(mockPrismaUser)
    expect(mockPrismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        token: 'anonymous-123456',
      }
    })
    expect(mockGetLinearUser).not.toHaveBeenCalled()
  })

  it('should handle encrypted anonymous token', async () => {
    mockDecrypt.mockReturnValueOnce('anonymous-123456')
    const anonymousUser = await getOrCreateUser('encrypted-anonymous-123456', true)
    expect(anonymousUser).toEqual(mockPrismaUser)
    expect(mockDecrypt).toHaveBeenCalledWith('encrypted-anonymous-123456')
    expect(mockPrismaClient.user.findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        token: 'encrypted-anonymous-123456',
      }
    })
    expect(mockGetLinearUser).not.toHaveBeenCalled()
  })

  it('should throw an error if anonymous user is not found', async () => {
    mockPrismaClient.user.findUniqueOrThrow.mockRejectedValue(new Error('User not found'))
    await expect(getOrCreateUser('anonymous-123456')).rejects.toThrow('User not found')
  })
})
