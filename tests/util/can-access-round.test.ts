import { PrismaClient, Round, User } from '@prisma/client'

import canAccessRound from '@aces/util/can-access-round'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    round: {
      findUnique: jest.fn()
    }
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  }
})

describe('canAccessRound', () => {
  let mockPrismaClient: {
    round: {
      findUnique: jest.Mock
    }
  }
  let mockUser: User
  let mockRound: { guests: User[] } & Round

  beforeEach(() => {
    mockPrismaClient = new PrismaClient() as unknown as {
      round: {
        findUnique: jest.Mock
      }
    }
    mockUser = { id: 'user-1', token: 'token-1' } as User
    mockRound = {
      id: 'round-1',
      creatorId: 'creator-1',
      guests: []
    } as unknown as { guests: User[] } & Round
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return true if user is the creator of the round', async () => {
    mockRound.creatorId = mockUser.id
    mockPrismaClient.round.findUnique.mockResolvedValue(mockRound)

    const result = await canAccessRound('round-1', mockUser)

    expect(result).toBe(true)
    expect(mockPrismaClient.round.findUnique).toHaveBeenCalledWith({
      where: { id: 'round-1' },
      include: { guests: true }
    })
  })

  it('should return true if user is a guest of the round', async () => {
    mockRound.guests = [{ userId: mockUser.id } as unknown as User]
    mockPrismaClient.round.findUnique.mockResolvedValue(mockRound)

    const result = await canAccessRound('round-1', mockUser)

    expect(result).toBe(true)
    expect(mockPrismaClient.round.findUnique).toHaveBeenCalledWith({
      where: { id: 'round-1' },
      include: { guests: true }
    })
  })

  it('should return false if user is neither the creator nor a guest', async () => {
    mockPrismaClient.round.findUnique.mockResolvedValue(mockRound)

    const result = await canAccessRound('round-1', mockUser)

    expect(result).toBe(false)
    expect(mockPrismaClient.round.findUnique).toHaveBeenCalledWith({
      where: { id: 'round-1' },
      include: { guests: true }
    })
  })

  it('should throw an error if the round is not found', async () => {
    mockPrismaClient.round.findUnique.mockResolvedValue(null)

    await expect(canAccessRound('non-existent-round', mockUser)).rejects.toThrow('Round not found')
    expect(mockPrismaClient.round.findUnique).toHaveBeenCalledWith({
      where: { id: 'non-existent-round' },
      include: { guests: true }
    })
  })
})
