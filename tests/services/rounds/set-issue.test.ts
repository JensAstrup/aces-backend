import { Issue } from '@linear/sdk'
import { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import getLinearIssue from '@aces/linear/get-linear-issue'
import setIssue from '@aces/services/rounds/set-issue'


jest.mock('@linear/sdk')
jest.mock('@aces/linear/get-linear-issue')

const mockGetLinearIssue = getLinearIssue as jest.MockedFunction<typeof getLinearIssue>

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    issue: {
      create: jest.fn()
    },
    round: {
      update: jest.fn()
    }
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  }
})


describe('setIssue', () => {
  let mockPrismaClient: {
    issue: {
      create: jest.Mock
    }
    round: {
      update: jest.Mock
    }
  }

  const mockRoundId = 'round-1'
  const mockIssueId = 'issue-1'
  const mockAccessToken = 'access-token'
  const mockLinearIssue: Issue = { id: 'linear-1' } as Issue

  beforeEach(() => {
    mockPrismaClient = new PrismaClient() as unknown as {
      issue: {
        create: jest.Mock
      }
      round: {
        update: jest.Mock
      }
    }
    jest.clearAllMocks()
  })

  it('should create a new issue and update the round', async () => {
    mockGetLinearIssue.mockResolvedValue(mockLinearIssue)
    mockPrismaClient.issue.create.mockResolvedValue({ id: 'db-issue-1' })
    mockPrismaClient.round.update.mockResolvedValue({})

    const result = await setIssue(mockRoundId, mockIssueId, mockAccessToken)

    expect(mockGetLinearIssue).toHaveBeenCalledWith(mockIssueId, mockAccessToken)
    expect(mockPrismaClient.issue.create).toHaveBeenCalledWith({
      data: {
        roundId: mockRoundId,
        linearId: mockLinearIssue.id,
      },
    })
    expect(mockPrismaClient.round.update).toHaveBeenCalledWith({
      where: {
        id: mockRoundId,
      },
      data: {
        currentIssueId: 'db-issue-1',
      },
    })
    expect(result).toEqual(mockLinearIssue)
  })

  it('should throw an error if getLinearIssue fails', async () => {
    mockGetLinearIssue.mockResolvedValue(null)

    await expect(setIssue(mockRoundId, mockIssueId, mockAccessToken)).rejects.toThrow('Failed to get issue')
    expect(mockPrismaClient.issue.create).not.toHaveBeenCalled()
    expect(mockPrismaClient.round.update).not.toHaveBeenCalled()
  })

  it('should ignore P2002 error (unique constraint violation)', async () => {
    mockGetLinearIssue.mockResolvedValue(mockLinearIssue)
    const mockError = new PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: '1.0' })
    mockPrismaClient.issue.create.mockRejectedValue(mockError)

    const result = await setIssue(mockRoundId, mockIssueId, mockAccessToken)

    expect(mockGetLinearIssue).toHaveBeenCalledWith(mockIssueId, mockAccessToken)
    expect(mockPrismaClient.issue.create).toHaveBeenCalled()
    expect(mockPrismaClient.round.update).not.toHaveBeenCalled()
    expect(result).toEqual(mockLinearIssue)
  })

  it('should throw non-P2002 errors', async () => {
    mockGetLinearIssue.mockResolvedValue(mockLinearIssue)
    const mockError = new PrismaClientKnownRequestError('Database error', { code: 'P1000', clientVersion: '1.0' })
    mockPrismaClient.issue.create.mockRejectedValue(mockError)

    await expect(setIssue(mockRoundId, mockIssueId, mockAccessToken)).rejects.toThrow('Database error')
    expect(mockPrismaClient.round.update).not.toHaveBeenCalled()
  })
})
