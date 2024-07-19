import { User } from '@prisma/client'
import { Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import createRoundHandler from '@aces/handlers/rounds/create'
import Request from '@aces/interfaces/request'
import createRound from '@aces/services/rounds/create-round'


jest.mock('@aces/services/rounds/create-round')

describe('createRoundHandler', () => {
  let mockRequest: Request
  let mockResponse: Partial<Response>
  let mockUser: User

  beforeEach(() => {
    mockUser = { linearId: 'mock-id' } as User
    mockRequest = {
      user: mockUser,
    } as Request
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    mockRequest.user = undefined

    await createRoundHandler(mockRequest, mockResponse as Response)

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.UNAUTHORIZED)
    expect(mockResponse.send).toHaveBeenCalledWith('Unauthorized')
  })

  it('should return 401 if user token is missing', async () => {
    // @ts-expect-error We are testing the case where user is anonymous
    mockRequest.user = { linearId: undefined }

    await createRoundHandler(mockRequest, mockResponse as Response)

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.UNAUTHORIZED)
    expect(mockResponse.send).toHaveBeenCalledWith('Unauthorized')
  })

  it('should create a round and return 201 with round data', async () => {
    const mockRound = { id: 'mock-round-id' };
    (createRound as jest.Mock).mockResolvedValue(mockRound)

    await createRoundHandler(mockRequest, mockResponse as Response)

    expect(createRound).toHaveBeenCalledWith(mockUser)
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.CREATED)
    expect(mockResponse.json).toHaveBeenCalledWith(mockRound)
  })

  it('should handle errors from createRound', async () => {
    const mockError = new Error('Failed to create round');
    (createRound as jest.Mock).mockRejectedValue(mockError)

    await createRoundHandler(mockRequest, mockResponse as Response)

    expect(createRound).toHaveBeenCalledWith(mockUser)
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.INTERNAL_SERVER_ERROR)
    expect(mockResponse.send).toHaveBeenCalledWith('Internal Server Error')
  })
})
