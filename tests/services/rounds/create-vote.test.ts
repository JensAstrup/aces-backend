import { Issue, PrismaClient, User, Vote } from '@prisma/client'

import createVote from '@aces/services/rounds/create-vote'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    vote: {
      upsert: jest.fn()
    }
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  }
})

describe('createVote', () => {
  let mockPrismaClient: {
    vote: {
      upsert: jest.Mock
    }
  }

  const mockIssue: Issue = { id: 'issue-1', roundId: 'round-1' } as Issue
  const mockUser: User = { id: 'user-1' } as User
  const mockEstimate = 5

  beforeEach(() => {
    jest.clearAllMocks()
    mockPrismaClient = new PrismaClient() as unknown as {
      vote: {
        upsert: jest.Mock
      }
    }
  })

  it('should create a new vote when it does not exist', async () => {
    const mockVote: Vote = {
      id: 'vote-1',
      issueId: mockIssue.id,
      userId: mockUser.id,
      value: mockEstimate
    } as Vote

    mockPrismaClient.vote.upsert.mockResolvedValue(mockVote)

    const result = await createVote(mockIssue, mockUser, mockEstimate)

    expect(result).toEqual(mockVote)
    expect(mockPrismaClient.vote.upsert).toHaveBeenCalledWith({
      where: {
        issueId_userId: {
          issueId: mockIssue.id,
          userId: mockUser.id
        }
      },
      create: {
        issueId: mockIssue.id,
        userId: mockUser.id,
        value: mockEstimate
      },
      update: {
        value: mockEstimate
      }
    })
  })

  it('should update an existing vote', async () => {
    const existingVote: Vote = {
      id: 'vote-1',
      issueId: mockIssue.id,
      userId: mockUser.id,
      value: 3
    } as Vote

    const updatedVote: Vote = { ...existingVote, value: mockEstimate }

    mockPrismaClient.vote.upsert.mockResolvedValue(updatedVote)

    const result = await createVote(mockIssue, mockUser, mockEstimate)

    expect(result).toEqual(updatedVote)
    expect(mockPrismaClient.vote.upsert).toHaveBeenCalledWith({
      where: {
        issueId_userId: {
          issueId: mockIssue.id,
          userId: mockUser.id
        }
      },
      create: {
        issueId: mockIssue.id,
        userId: mockUser.id,
        value: mockEstimate
      },
      update: {
        value: mockEstimate
      }
    })
  })

  it('should handle errors from prisma client', async () => {
    const mockError = new Error('Database error')
    mockPrismaClient.vote.upsert.mockRejectedValue(mockError)

    await expect(createVote(mockIssue, mockUser, mockEstimate)).rejects.toThrow('Database error')
  })
})
