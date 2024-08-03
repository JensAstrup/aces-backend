import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import setVoteHandler from '@aces/handlers/rounds/set-vote'
import getIssue from '@aces/services/issues/get-issue'
import RoundNotifier from '@aces/services/rounds/round-notifier'
import setVote from '@aces/services/rounds/set-vote'
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
jest.mock('@aces/services/rounds/set-vote')
jest.mock('@aces/util/can-access-round')
jest.mock('@aces/services/issues/get-issue')
jest.mock('@aces/services/rounds/round-notifier')

describe('setVoteHandler', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockUser: { id: string }
  let mockPrismaClient: { round: { findUnique: jest.Mock } }
  let mockRoundNotifier: jest.Mocked<RoundNotifier>
  let mockCanAccessRound: jest.Mock
  let mockGetIssue: jest.Mock
  let mockSetVote: jest.Mock

  beforeEach(() => {
    mockUser = { id: 'user-1' }
    mockRequest = {
      user: mockUser,
      params: { roundId: 'round-1' },
      body: { issueId: 'issue-1', vote: 5 }
    } as unknown as Request
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response
    mockPrismaClient = new PrismaClient() as unknown as { round: { findUnique: jest.Mock } }
    mockRoundNotifier = {
      voteSet: jest.fn()
    } as unknown as jest.Mocked<RoundNotifier>
    mockCanAccessRound = canAccessRound as jest.Mock
    mockGetIssue = getIssue as jest.Mock
    mockSetVote = setVote as jest.Mock
    (RoundNotifier as jest.Mock).mockImplementation(() => mockRoundNotifier)
    jest.clearAllMocks()
  })

  it('should set vote and return OK when user is authorized and round and issue exist', async () => {
    const mockRound = { id: 'round-1' }
    const mockIssue = { id: 'issue-1', roundId: 'round-1', linearId: 'issue-1' }
    mockCanAccessRound.mockResolvedValue(true)
    mockPrismaClient.round.findUnique.mockResolvedValue(mockRound)
    mockGetIssue.mockResolvedValue(mockIssue)

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(mockCanAccessRound).toHaveBeenCalledWith('round-1', mockUser)
    expect(mockPrismaClient.round.findUnique).toHaveBeenCalledWith({ where: { id: 'round-1' } })
    expect(mockSetVote).toHaveBeenCalledWith('round-1', 'issue-1', 5, mockUser)
    expect(mockGetIssue).toHaveBeenCalledWith({ roundId: 'round-1', linearId: 'issue-1' })
    expect(mockRoundNotifier.voteSet).toHaveBeenCalledWith(mockIssue)
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Estimate set' })
  })

  it('should return UNAUTHORIZED when user is not authenticated', async () => {
    mockRequest.user = undefined

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(mockCanAccessRound).not.toHaveBeenCalled()
    expect(mockPrismaClient.round.findUnique).not.toHaveBeenCalled()
    expect(mockSetVote).not.toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.UNAUTHORIZED)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
  })

  it('should return FORBIDDEN when user is not authorized to access the round', async () => {
    mockCanAccessRound.mockResolvedValue(false)

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(mockCanAccessRound).toHaveBeenCalledWith('round-1', mockUser)
    expect(mockPrismaClient.round.findUnique).not.toHaveBeenCalled()
    expect(mockSetVote).not.toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.FORBIDDEN)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden' })
  })

  it('should return NOT_FOUND when round does not exist', async () => {
    mockCanAccessRound.mockResolvedValue(true)
    mockPrismaClient.round.findUnique.mockResolvedValue(null)

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(mockCanAccessRound).toHaveBeenCalledWith('round-1', mockUser)
    expect(mockPrismaClient.round.findUnique).toHaveBeenCalledWith({ where: { id: 'round-1' } })
    expect(mockSetVote).not.toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.NOT_FOUND)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Round not found' })
  })

  it('should return NOT_FOUND when issue does not exist', async () => {
    const mockRound = { id: 'round-1' }
    mockCanAccessRound.mockResolvedValue(true)
    mockPrismaClient.round.findUnique.mockResolvedValue(mockRound)
    mockGetIssue.mockResolvedValue(null)

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(mockCanAccessRound).toHaveBeenCalledWith('round-1', mockUser)
    expect(mockPrismaClient.round.findUnique).toHaveBeenCalledWith({ where: { id: 'round-1' } })
    expect(mockSetVote).toHaveBeenCalledWith('round-1', 'issue-1', 5, mockUser)
    expect(mockGetIssue).toHaveBeenCalledWith({ roundId: 'round-1', linearId: 'issue-1' })
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.NOT_FOUND)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Issue not found' })
  })
})
