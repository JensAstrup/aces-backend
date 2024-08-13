import { User as LinearUser } from '@linear/sdk'
import { PrismaClient, User } from '@prisma/client'

import getLinearUser from '@aces/services/auth/linear-user'
import upsertUserFromLinearToken from '@aces/services/auth/upsert-user-from-linear-token'


jest.mock('@aces/services/auth/linear-user')

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      upsert: jest.fn().mockResolvedValue({
        id: '123456',
      } as User)
    }
  }

  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
  }
})

describe('upsertUserFromLinearToken', () => {
  const mockGetLinearUser = jest.mocked(getLinearUser)
  const mockPrismaClient = new PrismaClient() as unknown as {
      user: {
        upsert: jest.Mock
      }
    }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new user when the user does not exist', async () => {
    const mockLinearUser: LinearUser = {
      id: 'linear-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
    } as LinearUser

    const mockCreatedUser: User = {
      id: 'db-user-id',
      linearId: 'linear-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      token: 'access-token',
    } as User

    mockGetLinearUser.mockResolvedValue(mockLinearUser)
    mockPrismaClient.user.upsert.mockResolvedValue(mockCreatedUser)

    const result = await upsertUserFromLinearToken('access-token')

    expect(mockGetLinearUser).toHaveBeenCalledWith('access-token')
    expect(mockPrismaClient.user.upsert).toHaveBeenCalledWith({
      where: { linearId: 'linear-user-id' },
      update: {
        email: 'test@example.com',
        displayName: 'Test User',
        token: 'access-token',
      },
      create: {
        email: 'test@example.com',
        displayName: 'Test User',
        linearId: 'linear-user-id',
        token: 'access-token',
      },
    })
    expect(result).toEqual(mockCreatedUser)
  })

  it('should update an existing user when the user already exists', async () => {
    const mockLinearUser: LinearUser = {
      id: 'linear-user-id',
      email: 'updated@example.com',
      displayName: 'Updated User',
    } as LinearUser

    const mockUpdatedUser: User = {
      id: 'db-user-id',
      linearId: 'linear-user-id',
      email: 'updated@example.com',
      displayName: 'Updated User',
      token: 'new-access-token',
    } as User

    mockGetLinearUser.mockResolvedValue(mockLinearUser)
    mockPrismaClient.user.upsert.mockResolvedValue(mockUpdatedUser)

    const result = await upsertUserFromLinearToken('new-access-token')

    expect(mockGetLinearUser).toHaveBeenCalledWith('new-access-token')
    expect(mockPrismaClient.user.upsert).toHaveBeenCalledWith({
      where: { linearId: 'linear-user-id' },
      update: {
        email: 'updated@example.com',
        displayName: 'Updated User',
        token: 'new-access-token',
      },
      create: {
        email: 'updated@example.com',
        displayName: 'Updated User',
        linearId: 'linear-user-id',
        token: 'new-access-token',
      },
    })
    expect(result).toEqual(mockUpdatedUser)
  })

  it('should throw an error when getLinearUser fails', async () => {
    mockGetLinearUser.mockRejectedValue(new Error('Failed to fetch Linear user'))

    await expect(upsertUserFromLinearToken('invalid-token')).rejects.toThrow('Failed to fetch Linear user')
  })

  it('should throw an error when Prisma upsert fails', async () => {
    const mockLinearUser: LinearUser = {
      id: 'linear-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
    } as LinearUser

    mockGetLinearUser.mockResolvedValue(mockLinearUser)
    mockPrismaClient.user.upsert.mockRejectedValue(new Error('Database error'))

    await expect(upsertUserFromLinearToken('access-token')).rejects.toThrow('Database error')
  })
})
