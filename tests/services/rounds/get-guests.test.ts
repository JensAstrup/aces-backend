import { PrismaClient, Round, RoundGuest } from '@prisma/client'

import getGuests from '@aces/services/rounds/get-guests'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    roundGuest: {
      findMany: jest.fn(),
    },
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})


describe('getGuests', () => {
  const mockPrismaClient = new PrismaClient() as jest.Mocked<PrismaClient>
  const mockFindMany = mockPrismaClient.roundGuest.findMany as jest.MockedFunction<typeof mockPrismaClient.roundGuest.findMany>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch guests when given a round id string', async () => {
    const mockRoundId = 'test-round-id'
    const mockGuests: RoundGuest[] = [
      { userId: 'user1', roundId: mockRoundId },
      { userId: 'user2', roundId: mockRoundId },
    ]

    mockFindMany.mockResolvedValue(mockGuests)

    const result = await getGuests({ round: mockRoundId })

    expect(result).toEqual(mockGuests)
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { roundId: mockRoundId },
    })
  })

  it('should fetch guests when given a Round object', async () => {
    const mockRound: Round = { id: 'test-round-id' } as Round
    const mockGuests: RoundGuest[] = [
      { userId: 'user1', roundId: mockRound.id },
      { userId: 'user2', roundId: mockRound.id },
    ]

    mockFindMany.mockResolvedValue(mockGuests)

    const result = await getGuests({ round: mockRound })

    expect(result).toEqual(mockGuests)
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { roundId: mockRound.id },
    })
  })

  it('should handle an empty result', async () => {
    const mockRoundId = 'empty-round-id'

    mockFindMany.mockResolvedValue([])

    const result = await getGuests({ round: mockRoundId })

    expect(result).toEqual([])
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { roundId: mockRoundId },
    })
  })

  it('should throw an error when Prisma query fails', async () => {
    const mockRoundId = 'error-round-id'
    const mockError = new Error('Database error')

    mockFindMany.mockRejectedValue(mockError)

    await expect(getGuests({ round: mockRoundId })).rejects.toThrow('Database error')
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { roundId: mockRoundId },
    })
  })
})
