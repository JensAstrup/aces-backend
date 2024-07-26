import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import setVoteHandler from '@aces/handlers/rounds/set-vote'
import setVote from '@aces/services/rounds/set-vote'
import canAccessRound from '@aces/util/can-access-round'


jest.mock('@aces/services/rounds/set-vote')
jest.mock('@aces/util/can-access-round')
const mockSetVote = setVote as jest.MockedFunction<typeof setVote>
const mockCanAccessRound = canAccessRound as jest.MockedFunction<typeof canAccessRound>

describe('setVoteHandler', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockUser: { id: string }

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
    jest.clearAllMocks()
  })

  it('should set vote and return OK when user is authorized', async () => {
    (canAccessRound as jest.Mock).mockResolvedValue(true)

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(canAccessRound).toHaveBeenCalledWith('round-1', mockUser)
    expect(setVote).toHaveBeenCalledWith('round-1', 'issue-1', 5, mockUser)
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Estimate set' })
  })

  it('should return UNAUTHORIZED when user is not authenticated', async () => {
    mockRequest.user = undefined

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(canAccessRound).not.toHaveBeenCalled()
    expect(setVote).not.toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.UNAUTHORIZED)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
  })

  it('should return FORBIDDEN when user is not authorized to access the round', async () => {
    (canAccessRound as jest.Mock).mockResolvedValue(false)

    await setVoteHandler(mockRequest as Request, mockResponse as Response)

    expect(canAccessRound).toHaveBeenCalledWith('round-1', mockUser)
    expect(setVote).not.toHaveBeenCalled()
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.FORBIDDEN)
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Forbidden' })
  })
})
