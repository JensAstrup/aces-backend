import { PrismaClient, Round, User } from '@prisma/client'

import removeGuestFromRound from '@aces/services/rounds/remove-guest-from-round'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    round: {
      update: jest.fn()
    }
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  }
})

describe('removeGuestFromRound', () => {
  const mockPrismaClient = new PrismaClient() as unknown as {
    round: {
      update: jest.Mock
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update the round to disconnect the guest', async () => {
    const mockRound: Round = { id: 'test-round-id' } as Round
    const mockUser: User = { id: 'test-user-id' } as User

    await removeGuestFromRound(mockRound, mockUser)

    expect(mockPrismaClient.round.update).toHaveBeenCalledWith({
      where: {
        id: 'test-round-id'
      },
      data: {
        guests: {
          disconnect: {
            userId: 'test-user-id'
          }
        }
      }
    })
  })

  it('should not throw an error when the update is successful', async () => {
    const mockRound: Round = { id: 'test-round-id' } as Round
    const mockUser: User = { id: 'test-user-id' } as User

    mockPrismaClient.round.update.mockResolvedValue({})

    await expect(removeGuestFromRound(mockRound, mockUser)).resolves.not.toThrow()
  })

  it('should throw an error when the update fails', async () => {
    const mockRound: Round = { id: 'test-round-id' } as Round
    const mockUser: User = { id: 'test-user-id' } as User

    const mockError = new Error('Update failed')
    mockPrismaClient.round.update.mockRejectedValue(mockError)

    await expect(removeGuestFromRound(mockRound, mockUser)).rejects.toThrow('Update failed')
  })
})
