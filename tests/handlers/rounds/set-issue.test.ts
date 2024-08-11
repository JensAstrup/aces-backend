import { Issue } from '@linear/sdk'
import { User, Vote } from '@prisma/client'
import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import setIssueHandler from '@aces/handlers/rounds/set-issue'
import getIssue from '@aces/services/issues/get-issue'
import getIssueVotes from '@aces/services/issues/get-issue-votes'
import getGuests from '@aces/services/rounds/get-guests'
import setIssue from '@aces/services/rounds/set-issue'
import sendMessageToRound from '@aces/socket/send-message-to-round'
import decrypt from '@aces/util/encryption/decrypt'


jest.mock('@aces/services/rounds/set-issue')
jest.mock('@aces/services/issues/get-issue')
jest.mock('@aces/services/issues/get-issue-votes')
jest.mock('@aces/services/rounds/get-guests')
jest.mock('@aces/socket/send-message-to-round')
jest.mock('@aces/util/encryption/decrypt')

const mockSetIssue = setIssue as jest.MockedFunction<typeof setIssue>
const mockGetIssue = getIssue as jest.MockedFunction<typeof getIssue>
const mockGetIssueVotes = getIssueVotes as jest.MockedFunction<typeof getIssueVotes>
const mockGetGuests = getGuests as jest.MockedFunction<typeof getGuests>
const mockSendMessageToRound = sendMessageToRound as jest.MockedFunction<typeof sendMessageToRound>
const mockDecrypt = decrypt as jest.MockedFunction<typeof decrypt>

describe('setIssueHandler', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockStatus: jest.Mock
  let mockSend: jest.Mock
  let mockUser: User

  beforeEach(() => {
    mockStatus = jest.fn().mockReturnThis()
    mockSend = jest.fn().mockReturnThis()

    mockResponse = {
      status: mockStatus,
      send: mockSend,
    }

    mockUser = {
      linearId: 'test-linear-id',
      token: 'test-token',
      email: 'test-email',
      displayName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User

    mockRequest = {
      user: mockUser,
      params: { roundId: 'test-round-id' },
      body: { issue: 'test-issue-id' },
    }

    mockDecrypt.mockReturnValue('decrypted-token')
    mockSetIssue.mockResolvedValue({ id: 'test-issue-id', linearId: 'test-linear-id', title: 'Test Issue' } as unknown as Issue)
    mockGetIssue.mockResolvedValue({ id: 'test-issue-id', linearId: 'test-linear-id', roundId: 'test-round-id' })
    mockGetIssueVotes.mockResolvedValue([{ vote: 1 }, { vote: 2 }] as Vote[])
    mockGetGuests.mockResolvedValue([{ userId: 'guest-1', roundId: 'test-round-id' }, { userId: 'guest-2', roundId: 'test-round-id' }])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    mockRequest.user = undefined

    await setIssueHandler(mockRequest as Request, mockResponse as Response)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatusCodes.UNAUTHORIZED)
    expect(mockSend).toHaveBeenCalledWith('Unauthorized')
  })

  it('should return 401 if user does not have a linearId', async () => {
    mockRequest.user = { ...mockUser, linearId: undefined } as unknown as User

    await setIssueHandler(mockRequest as Request, mockResponse as Response)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatusCodes.UNAUTHORIZED)
    expect(mockSend).toHaveBeenCalledWith('Unauthorized')
  })

  it('should return 404 if issue is not found in database', async () => {
    mockGetIssue.mockResolvedValue(null)

    await setIssueHandler(mockRequest as Request, mockResponse as Response)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatusCodes.NOT_FOUND)
    expect(mockSend).toHaveBeenCalledWith('Issue not found in database')
  })

  it('should set issue, get votes and guests, and send message to round', async () => {
    await setIssueHandler(mockRequest as Request, mockResponse as Response)

    expect(mockDecrypt).toHaveBeenCalledWith(mockUser.token)
    expect(mockSetIssue).toHaveBeenCalledWith('test-round-id', 'test-issue-id', 'decrypted-token')
    expect(mockGetIssue).toHaveBeenCalledWith({ roundId: 'test-round-id', linearId: 'test-issue-id' })
    expect(mockGetIssueVotes).toHaveBeenCalledWith({ id: 'test-issue-id', linearId: 'test-linear-id', roundId: 'test-round-id' })
    expect(mockGetGuests).toHaveBeenCalledWith({ round: 'test-round-id' })
    expect(mockSendMessageToRound).toHaveBeenCalledWith('test-round-id', {
      type: 'issue',
      payload: {
        issue: { id: 'test-issue-id', linearId: 'test-linear-id', title: 'Test Issue' },
        votes: [1, 2],
        expectedVotes: 3
      },
      event: 'roundIssueUpdated'
    })
    expect(mockStatus).toHaveBeenCalledWith(HttpStatusCodes.NO_CONTENT)
    expect(mockSend).toHaveBeenCalled()
  })
})
