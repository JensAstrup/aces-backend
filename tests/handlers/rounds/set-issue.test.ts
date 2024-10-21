import { Issue as LinearIssue } from '@linear/sdk'
import { User, Vote, Issue } from '@prisma/client'
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
      // @ts-expect-error We're just mocking the properties we need
      session: { user: mockUser },
      params: { roundId: 'test-round-id' },
      body: { issue: 'test-issue-id' },
    }

    mockDecrypt.mockReturnValue('decrypted-token')
    mockSetIssue.mockResolvedValue({ id: 'test-issue-id', linearId: 'test-linear-id', roundId: 'test-round-id', title: 'Test Issue', createdAt: new Date() } as unknown as LinearIssue)
    mockGetIssue.mockResolvedValue({ id: 'test-issue-id', linearId: 'test-linear-id', roundId: 'test-round-id', createdAt: new Date() } as unknown as Issue)
    mockGetIssueVotes.mockResolvedValue([{ value: 1 }, { vote: 2 }] as Vote[])
    mockGetGuests.mockResolvedValue([{ userId: 'guest-1', roundId: 'test-round-id' }, { userId: 'guest-2', roundId: 'test-round-id' }])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    mockRequest.session!.user = undefined

    await setIssueHandler(mockRequest as Request, mockResponse as Response)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatusCodes.UNAUTHORIZED)
    expect(mockSend).toHaveBeenCalledWith('Unauthorized')
  })

  it('should return 401 Unauthorized if user.token is missing', async () => {
    mockRequest = {
      session: {
        // @ts-expect-error Property is missing intentionally
        user: {
          linearId: 'some-linear-id',
        },
      },
      params: {
        roundId: 'some-round-id',
      },
      body: {
        issue: 'some-issue-id',
      },
    }

    await setIssueHandler(mockRequest as Request, mockResponse as Response)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatusCodes.UNAUTHORIZED)
    expect(mockSend).toHaveBeenCalled()
  })

  it('should return 401 if user does not have a linearId', async () => {
    mockRequest.session!.user = { ...mockUser, linearId: undefined } as unknown as User

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
    expect(mockGetIssueVotes).toHaveBeenCalled()
    expect(mockGetGuests).toHaveBeenCalledWith({ round: 'test-round-id' })
    expect(mockSendMessageToRound).toHaveBeenCalledWith('test-round-id', {
      type: 'issue',
      payload: {
        issue: { id: 'test-issue-id', linearId: 'test-linear-id', title: 'Test Issue', createdAt: expect.any(Date), roundId: 'test-round-id' },
        votes: [1, undefined],
        expectedVotes: 3,
      },
      event: 'roundIssueUpdated'
    })
    const sendMessageToRoundCalls = mockSendMessageToRound.mock.calls
    expect(sendMessageToRoundCalls.length).toBe(1)
    expect(mockStatus).toHaveBeenCalledWith(HttpStatusCodes.NO_CONTENT)
    expect(mockSend).toHaveBeenCalled()
  })
})
