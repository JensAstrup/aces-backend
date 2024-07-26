import { Issue, PrismaClient, Round } from '@prisma/client'

import getIssue from '@aces/services/issues/get-issue'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    issue: {
      findUnique: jest.fn(),
      findFirst: jest.fn()
    }
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  }
})

describe('getIssue', () => {
  const mockPrismaClient = new PrismaClient() as unknown as {
      issue: {
        findUnique: jest.Mock
        findFirst: jest.Mock
      }
    }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should find an issue by issueId and roundId', async () => {
    const mockIssue: Issue = { id: 'issue-1', roundId: 'round-1', linearId: 'linear-1' } as Issue
    mockPrismaClient.issue.findUnique.mockResolvedValue(mockIssue)

    const result = await getIssue({ roundId: 'round-1', issueId: 'issue-1' })

    expect(result).toEqual(mockIssue)
    expect(mockPrismaClient.issue.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'issue-1',
        roundId: 'round-1'
      }
    })
    expect(mockPrismaClient.issue.findFirst).not.toHaveBeenCalled()
  })

  it('should find an issue by linearId and roundId', async () => {
    const mockIssue: Issue = { id: 'issue-1', roundId: 'round-1', linearId: 'linear-1' } as Issue
    mockPrismaClient.issue.findFirst.mockResolvedValue(mockIssue)

    const result = await getIssue({ roundId: 'round-1', linearId: 'linear-1' })

    expect(result).toEqual(mockIssue)
    expect(mockPrismaClient.issue.findFirst).toHaveBeenCalledWith({
      where: {
        linearId: 'linear-1',
        roundId: 'round-1'
      }
    })
    expect(mockPrismaClient.issue.findUnique).not.toHaveBeenCalled()
  })

  it('should return null if no issue is found by issueId', async () => {
    mockPrismaClient.issue.findUnique.mockResolvedValue(null)

    const result = await getIssue({ roundId: 'round-1', issueId: 'non-existent' })

    expect(result).toBeNull()
    expect(mockPrismaClient.issue.findUnique).toHaveBeenCalledWith({
      where: {
        id: 'non-existent',
        roundId: 'round-1'
      }
    })
  })

  it('should return null if no issue is found by linearId', async () => {
    mockPrismaClient.issue.findFirst.mockResolvedValue(null)

    const result = await getIssue({ roundId: 'round-1', linearId: 'non-existent' })

    expect(result).toBeNull()
    expect(mockPrismaClient.issue.findFirst).toHaveBeenCalledWith({
      where: {
        linearId: 'non-existent',
        roundId: 'round-1'
      }
    })
  })
})
