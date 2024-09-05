import { Issue, PrismaClient, Vote } from '@prisma/client'

import getIssueVotes from '@aces/services/issues/get-issue-votes'


type MockPrismaClient = {
  vote: {
    findMany: jest.Mock
  }
}

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    vote: {
      findMany: jest.fn(),
    },
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  }
})

describe('getIssueVotes', () => {
  let mockPrismaClient: MockPrismaClient

  beforeEach(() => {
    jest.clearAllMocks()

    const MockedPrismaClass = PrismaClient as jest.MockedClass<typeof PrismaClient>
    const prismaInstance = new MockedPrismaClass()
    mockPrismaClient = prismaInstance as unknown as MockPrismaClient
  })

  it('should return votes for a given issue', async () => {
    const mockIssue: Issue = { id: 'issue-1' } as Issue
    const mockVotes: Vote[] = [
      { id: 'vote-1', issueId: 'issue-1' } as Vote,
      { id: 'vote-2', issueId: 'issue-1' } as Vote,
    ]

    mockPrismaClient.vote.findMany.mockResolvedValue(mockVotes)

    const result = await getIssueVotes(mockIssue)

    expect(result).toEqual(mockVotes)
    expect(mockPrismaClient.vote.findMany).toHaveBeenCalledWith({
      where: {
        issueId: 'issue-1',
      },
    })
  })

  it('should return an empty array when no votes are found', async () => {
    const mockIssue: Issue = { id: 'issue-2' } as Issue

    mockPrismaClient.vote.findMany.mockResolvedValue([])

    const result = await getIssueVotes(mockIssue)

    expect(result).toEqual([])
    expect(mockPrismaClient.vote.findMany).toHaveBeenCalledWith({
      where: {
        issueId: 'issue-2',
      },
    })
  })

  it('should throw an error when the database query fails', async () => {
    const mockIssue: Issue = { id: 'issue-3' } as Issue
    const mockError = new Error('Database query failed')

    mockPrismaClient.vote.findMany.mockRejectedValue(mockError)

    await expect(getIssueVotes(mockIssue)).rejects.toThrow('Database query failed')
    expect(mockPrismaClient.vote.findMany).toHaveBeenCalledWith({
      where: {
        issueId: 'issue-3',
      },
    })
  })
})
