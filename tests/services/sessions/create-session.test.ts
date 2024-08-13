import { PrismaClient, Round, Session, User } from '@prisma/client'

import createSession from '@aces/services/sessions/create-session'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    session: {
      create: jest.fn(),
    },
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})

describe('createSession', () => {
  const mockPrismaClient = new PrismaClient() as jest.Mocked<PrismaClient>
  const mockSessionCreate = mockPrismaClient.session.create as jest.MockedFunction<typeof mockPrismaClient.session.create>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a session with the provided user and round', async () => {
    const mockUser: User = { id: 'user-id' } as User
    const mockRound: Round = { id: 'round-id' } as Round
    const mockSession: Session = {
      id: 'session-id',
      userId: 'user-id',
      roundId: 'round-id',
      createdAt: new Date(),
      token: 'session-token',
    }

    mockSessionCreate.mockResolvedValue(mockSession)

    const result = await createSession(mockUser, mockRound)

    expect(mockSessionCreate).toHaveBeenCalledWith({
      data: {
        user: { connect: { id: 'user-id' } },
        round: { connect: { id: 'round-id' } },
      },
    })
    expect(result).toEqual(mockSession)
  })

  it('should throw an error if session creation fails', async () => {
    const mockUser: User = { id: 'user-id' } as User
    const mockRound: Round = { id: 'round-id' } as Round
    const mockError = new Error('Failed to create session')

    mockSessionCreate.mockRejectedValue(mockError)

    await expect(createSession(mockUser, mockRound)).rejects.toThrow('Failed to create session')
  })
})
