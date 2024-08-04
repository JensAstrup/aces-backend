import { User } from '@prisma/client'
import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import setIssueHandler from '@aces/handlers/rounds/set-issue'
import setIssue from '@aces/services/rounds/set-issue'
import sendMessageToRound from '@aces/socket/send-message-to-round'
import decrypt from '@aces/util/encryption/decrypt'


jest.mock('@aces/services/rounds/set-issue')
jest.mock('@aces/socket/send-message-to-round')
jest.mock('@aces/util/encryption/decrypt')

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
    // @ts-expect-error Forcing a test case where linearId is undefined
    mockRequest.user = { ...mockUser, linearId: undefined }

    await setIssueHandler(mockRequest as Request, mockResponse as Response)

    expect(mockStatus).toHaveBeenCalledWith(HttpStatusCodes.UNAUTHORIZED)
    expect(mockSend).toHaveBeenCalledWith('Unauthorized')
  })

  it('should set issue and send message to round', async () => {
    const decryptedToken = 'decrypted-token';
    (decrypt as jest.Mock).mockReturnValue(decryptedToken)
    const mockIssue = { id: 'test-issue-id', linearId: 'test-linear-id', title: 'Test Issue' };
    (setIssue as jest.Mock).mockResolvedValue(mockIssue)

    await setIssueHandler(mockRequest as Request, mockResponse as Response)

    expect(decrypt).toHaveBeenCalledWith(mockUser.token)
    expect(setIssue).toHaveBeenCalledWith(mockRequest.params?.roundId, mockRequest.body.issue, decryptedToken)
    expect(sendMessageToRound).toHaveBeenCalledWith(mockRequest.params?.roundId, { type: 'issue', payload: mockIssue, event: 'roundIssueUpdated' })
    expect(mockStatus).toHaveBeenCalledWith(HttpStatusCodes.NO_CONTENT)
  })
})
