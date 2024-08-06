import { PrismaClient, Round } from '@prisma/client'

import endRound from '@aces/services/rounds/end-round'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    round: {
      update: jest.fn(),
    },
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})

describe('endRound', () => {
  const mockPrismaClient = new PrismaClient() as unknown as {
    round: {
      update: jest.Mock
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update the round status to FINISHED', async () => {
    const mockRound: Round = { id: 'test-round-id' } as Round

    await endRound(mockRound)

    expect(mockPrismaClient.round.update).toHaveBeenCalledWith({
      where: {
        id: 'test-round-id',
      },
      data: {
        status: 'FINISHED',
      },
    })
  })

  it('should not throw an error when the update is successful', async () => {
    const mockRound: Round = { id: 'test-round-id' } as Round

    mockPrismaClient.round.update.mockResolvedValue({})

    await expect(endRound(mockRound)).resolves.not.toThrow()
  })

  it('should throw an error when the update fails', async () => {
    const mockRound: Round = { id: 'test-round-id' } as Round

    const mockError = new Error('Update failed')
    mockPrismaClient.round.update.mockRejectedValue(mockError)

    await expect(endRound(mockRound)).rejects.toThrow('Update failed')
  })
})
