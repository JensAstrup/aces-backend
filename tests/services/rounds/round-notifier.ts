import { Issue, PrismaClient, Round, Vote } from '@prisma/client'

import { VoteUpdatedMessage } from '@aces/interfaces/socket-message'
import RoundNotifier from '@aces/services/rounds/round-notifier'
import sendMessageToRound from '@aces/socket/send-message-to-round'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    vote: {
      findMany: jest.fn()
    }
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  }
})

jest.mock('@aces/socket/send-message-to-round')

describe('RoundNotifier', () => {
  let roundNotifier: RoundNotifier
  let mockRound: Round
  let mockIssue: Issue
  let mockPrismaClient: { vote: { findMany: jest.Mock } }
  let mockSendMessageToRound: jest.Mock

  beforeEach(() => {
    mockRound = { id: 'round-1' } as Round
    mockIssue = { id: 'issue-1' } as Issue
    roundNotifier = new RoundNotifier(mockRound)
    mockPrismaClient = new PrismaClient() as unknown as { vote: { findMany: jest.Mock } }
    mockSendMessageToRound = sendMessageToRound as jest.Mock

    jest.clearAllMocks()
  })

  it('should fetch votes, map them correctly, and send a message when voteSet is called', async () => {
    const mockVoteRecords: Vote[] = [
      { id: 'vote-1', vote: 3, issueId: 'issue-1', userId: 'user-1' },
      { id: 'vote-2', vote: 5, issueId: 'issue-1', userId: 'user-2' }
    ] as Vote[]

    mockPrismaClient.vote.findMany.mockResolvedValue(mockVoteRecords)

    await roundNotifier.voteSet(mockIssue)

    expect(mockPrismaClient.vote.findMany).toHaveBeenCalledWith({
      where: {
        issue: {
          id: mockIssue.id
        }
      }
    })

    const expectedMessage: VoteUpdatedMessage = {
      event: 'voteUpdated',
      type: 'vote',
      payload: {
        issueId: mockIssue.id,
        votes: [3, 5]
      }
    }

    expect(mockSendMessageToRound).toHaveBeenCalledWith(mockRound.id, expectedMessage)
  })

  it('should send an empty votes array when no votes are found', async () => {
    mockPrismaClient.vote.findMany.mockResolvedValue([])

    await roundNotifier.voteSet(mockIssue)

    expect(mockPrismaClient.vote.findMany).toHaveBeenCalledWith({
      where: {
        issue: {
          id: mockIssue.id
        }
      }
    })

    const expectedMessage: VoteUpdatedMessage = {
      event: 'voteUpdated',
      type: 'vote',
      payload: {
        issueId: mockIssue.id,
        votes: []
      }
    }

    expect(mockSendMessageToRound).toHaveBeenCalledWith(mockRound.id, expectedMessage)
  })

  it('should handle errors when fetching votes', async () => {
    const mockError = new Error('Database error')
    mockPrismaClient.vote.findMany.mockRejectedValue(mockError)

    await expect(roundNotifier.voteSet(mockIssue)).rejects.toThrow('Database error')

    expect(mockPrismaClient.vote.findMany).toHaveBeenCalledWith({
      where: {
        issue: {
          id: mockIssue.id
        }
      }
    })

    expect(mockSendMessageToRound).not.toHaveBeenCalled()
  })

  it('should correctly map vote records to vote values', async () => {
    const mockVoteRecords: Vote[] = [
      { id: 'vote-1', vote: 1, issueId: 'issue-1', userId: 'user-1' },
      { id: 'vote-2', vote: 3, issueId: 'issue-1', userId: 'user-2' },
      { id: 'vote-3', vote: 5, issueId: 'issue-1', userId: 'user-3' }
    ] as Vote[]

    mockPrismaClient.vote.findMany.mockResolvedValue(mockVoteRecords)

    await roundNotifier.voteSet(mockIssue)

    const expectedMessage: VoteUpdatedMessage = {
      event: 'voteUpdated',
      type: 'vote',
      payload: {
        issueId: mockIssue.id,
        votes: [1, 3, 5]
      }
    }

    expect(mockSendMessageToRound).toHaveBeenCalledWith(mockRound.id, expectedMessage)
  })
})
