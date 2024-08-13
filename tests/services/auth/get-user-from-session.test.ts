import { PrismaClient, Session, User } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import NotFoundError from '@aces/errors/not-found'
import getUserFromSession from '@aces/services/auth/get-user-from-session'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    session: {
      findUniqueOrThrow: jest.fn().mockResolvedValue({
        id: '123456',
      } as Session)
    }
  }

  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
  }
})

describe('getUserFromSession', () => {
  const mockPrismaClient = new PrismaClient() as unknown as {
      session: {
        findUniqueOrThrow: jest.Mock
      }
    }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockFindUniqueOrThrow = mockPrismaClient.session.findUniqueOrThrow

  it('should return a user when a valid session is found', async () => {
    const mockUser: User = {
      id: 'user-id',
      email: 'test@example.com',
      name: 'Test User',
    } as unknown as User

    const mockSession: { user: User } & Session = {
      id: 'session-id',
      token: 'valid-token',
      userId: 'user-id',
      user: mockUser,
    } as { user: User } & Session

    mockFindUniqueOrThrow.mockResolvedValue(mockSession)

    const result = await getUserFromSession('valid-token')

    expect(mockFindUniqueOrThrow).toHaveBeenCalledWith({
      where: { token: 'valid-token' },
      include: { user: true },
    })
    expect(result).toEqual(mockUser)
  })

  it('should throw NotFoundError when session is found but user is not attached', async () => {
    const mockSession: Session = {
      id: 'session-id',
      token: 'valid-token',
      userId: 'user-id',
    } as Session

    mockFindUniqueOrThrow.mockResolvedValue(mockSession)

    await expect(getUserFromSession('valid-token')).rejects.toThrow(NotFoundError)
    await expect(getUserFromSession('valid-token')).rejects.toThrow('User not found')
  })

  it('should throw an error when session is not found', async () => {
    mockFindUniqueOrThrow.mockRejectedValue(
      new PrismaClientKnownRequestError('Session not found', {
        code: 'P2025',
        clientVersion: '4.7.1',
      })
    )

    await expect(getUserFromSession('invalid-token')).rejects.toThrow(PrismaClientKnownRequestError)
  })
})
