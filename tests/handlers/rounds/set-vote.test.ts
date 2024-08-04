import { jest } from '@jest/globals'
import { Issue, Round, RoundGuest, User } from '@prisma/client'
import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import setVoteHandler from '@aces/handlers/rounds/set-vote'
import RoundNotifier from '@aces/services/rounds/round-notifier'
import setVote from '@aces/services/rounds/set-vote'
import canAccessRound from '@aces/util/can-access-round'


jest.mock('@aces/services/rounds/round-notifier')
jest.mock('@aces/services/rounds/set-vote')
jest.mock('@aces/util/can-access-round')

describe('setVoteHandler', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockUser: User
  let mockCanAccessRound: jest.MockedFunction<typeof canAccessRound>
  let mockSetVote: jest.MockedFunction<typeof setVote>
  let MockedRoundNotifier: jest.Mocked<typeof RoundNotifier>

  beforeEach(() => {
    mockUser = {
      id: 'user-1',
      linearId: null,
      email: 'user@example.com',
      displayName: 'Test User',
      token: 'user-token',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    mockRequest = {
      user: mockUser,
      params: { roundId: 'round-1' },
      body: { issueId: 'linear-1', vote: 5 }
    }
    mockResponse = {
    // @ts-expect-error mock implementation
      status: jest.fn().mockReturnThis(),
      // @ts-expect-error mock implementation
      json: jest.fn()
    }
    mockCanAccessRound = canAccessRound as jest.MockedFunction<typeof canAccessRound>
    mockSetVote = setVote as jest.MockedFunction<typeof setVote>
    MockedRoundNotifier = RoundNotifier as jest.Mocked<typeof RoundNotifier>

    jest.clearAllMocks()
  })

  it('should set vote and return OK when user is authorized and round and issue exist', async () => {
    const mockRound = {
      id: 'round-1',
      creatorId: 'creator-1',
      status: 'CREATED',
      currentIssueId: 'issue-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      guests: [{ userId: 'user-2', roundId: 'round-1' }],
      issues: [{ id: 'issue-1', roundId: 'round-1', linearId: 'linear-1' }]
    } as { guests: RoundGuest[], issues: Issue[] } & Round

    mockCanAccessRound.mockResolvedValue(true)
    MockedRoundNotifier.get.mockResolvedValue(mockRound)
    MockedRoundNotifier.prototype.voteSet = jest.fn()

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(mockCanAccessRound).toHaveBeenCalledWith('round-1', mockUser)
    expect(mockSetVote).toHaveBeenCalledWith('round-1', 'linear-1', 5, mockUser)
    expect(MockedRoundNotifier.get).toHaveBeenCalledWith('round-1')
    expect(MockedRoundNotifier.prototype.voteSet).toHaveBeenCalledWith(mockRound.issues[0])
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Estimate set' })
  })

  it('should return UNAUTHORIZED when user is not authenticated', async () => {
    mockRequest.user = undefined

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(mockCanAccessRound).not.toHaveBeenCalled()
    expect(MockedRoundNotifier.get).not.toHaveBeenCalled()
    expect(mockSetVote).not.toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.UNAUTHORIZED)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
  })

  it('should return FORBIDDEN when user is not authorized to access the round', async () => {
    mockCanAccessRound.mockResolvedValue(false)

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(mockCanAccessRound).toHaveBeenCalledWith('round-1', mockUser)
    expect(MockedRoundNotifier.get).not.toHaveBeenCalled()
    expect(mockSetVote).not.toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.FORBIDDEN)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden' })
  })

  it('should return NOT_FOUND when round does not exist', async () => {
    mockCanAccessRound.mockResolvedValue(true)
    MockedRoundNotifier.get.mockResolvedValue(null)

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(mockCanAccessRound).toHaveBeenCalledWith('round-1', mockUser)
    expect(MockedRoundNotifier.get).toHaveBeenCalledWith('round-1')
    expect(mockSetVote).not.toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.NOT_FOUND)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Round not found' })
  })

  it('should return NOT_FOUND when issue does not exist', async () => {
    const mockRound = {
      id: 'round-1',
      creatorId: 'creator-1',
      status: 'CREATED',
      currentIssueId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      guests: [{ userId: 'user-2', roundId: 'round-1' }],
      issues: []
    } as { guests: RoundGuest[], issues: Issue[] } & Round

    mockCanAccessRound.mockResolvedValue(true)
    MockedRoundNotifier.get.mockResolvedValue(mockRound)
    MockedRoundNotifier.prototype.voteSet = jest.fn()

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(mockCanAccessRound).toHaveBeenCalledWith('round-1', mockUser)
    expect(mockSetVote).toHaveBeenCalledWith('round-1', 'linear-1', 5, mockUser)
    expect(MockedRoundNotifier.get).toHaveBeenCalledWith('round-1')
    expect(MockedRoundNotifier.prototype.voteSet).not.toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.NOT_FOUND)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Issue not found' })
  })
})
