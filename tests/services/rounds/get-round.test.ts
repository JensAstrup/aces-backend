import { Prisma, PrismaClient, Round } from '@prisma/client'

import getRound from '@aces/services/rounds/get-round'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    round: {
      findUnique: jest.fn(),
    },
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    Prisma: {
      PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      },
    },
  }
})

describe('getRound', () => {
  const mockRoundId = 'mock-round-id'
  const mockRound: Round = {
    id: mockRoundId,
    creatorId: 'mock-creator-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'CREATED',
    currentIssueId: null,
  }
  const mockPrismaClient = new PrismaClient() as unknown as {
    round: {
      findUnique: jest.MockedFunction<typeof PrismaClient.prototype.round.findUnique>
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return a round when it exists', async () => {
    mockPrismaClient.round.findUnique.mockResolvedValue(mockRound)

    const result = await getRound(mockRoundId)

    expect(result).toEqual(mockRound)
    expect(mockPrismaClient.round.findUnique).toHaveBeenCalledWith({
      where: { id: mockRoundId },
    })
  })

  it('should throw a Database error when a PrismaClientKnownRequestError occurs', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('Prisma error', { code: 'P2002', clientVersion: '2.20.0' })
    mockPrismaClient.round.findUnique.mockRejectedValue(prismaError)

    await expect(getRound(mockRoundId)).rejects.toThrow('Database error: Prisma error')
  })

  it('should throw an Unexpected error with stringified message for non-Error objects', async () => {
    const nonErrorObject = { message: 'Non-error object' }
    mockPrismaClient.round.findUnique.mockRejectedValue(nonErrorObject)

    await expect(getRound(mockRoundId)).rejects.toThrow('Unexpected error: [object Object]')
  })

  it('should throw an Unexpected error for unknown errors', async () => {
    const unknownError = new Error('Unknown error')
    mockPrismaClient.round.findUnique.mockRejectedValue(unknownError)

    await expect(getRound(mockRoundId)).rejects.toThrow('Unexpected error: Unknown error')
  })

  it('should throw NotFoundError when round is not found', async () => {
    mockPrismaClient.round.findUnique.mockResolvedValue(null)

    await expect(getRound(mockRoundId)).rejects.toThrow('Round not found')
  })
})
