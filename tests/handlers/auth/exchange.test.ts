import { Round, Session, User } from '@prisma/client'
import { Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import exchange, { IncomingAccessTokenRequest } from '@aces/handlers/auth/exchange'
import exchangeCode from '@aces/services/auth/exchange-code'
import upsertUserFromLinearToken from '@aces/services/auth/upsert-user-from-linear-token'
import createRound from '@aces/services/rounds/create-round'
import createSession from '@aces/services/sessions/create-session'


jest.mock('@aces/services/auth/exchange-code')
jest.mock('@aces/services/auth/upsert-user-from-linear-token')
jest.mock('@aces/services/rounds/create-round')
jest.mock('@aces/services/sessions/create-session')

describe('exchange', () => {
  const mockExchangeCode = exchangeCode as jest.MockedFunction<typeof exchangeCode>
  const mockUpsertUserFromLinearToken = upsertUserFromLinearToken as jest.MockedFunction<typeof upsertUserFromLinearToken>
  const mockCreateRound = createRound as jest.MockedFunction<typeof createRound>
  const mockCreateSession = createSession as jest.MockedFunction<typeof createSession>

  const mockUser: User = { id: 'user-id' } as User
  const mockRound: Round = { id: 'round-id' } as Round
  const mockSession: Session = { token: 'session-token' } as Session

  let mockRequest: IncomingAccessTokenRequest
  let mockResponse: Response

  beforeEach(() => {
    mockRequest = {
      body: {
        code: 'test-code',
      },
    } as IncomingAccessTokenRequest

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response

    mockExchangeCode.mockResolvedValue('access-token')
    mockUpsertUserFromLinearToken.mockResolvedValue(mockUser)
    mockCreateRound.mockResolvedValue(mockRound)
    mockCreateSession.mockResolvedValue(mockSession)
  })

  it('should exchange code and return a session token', async () => {
    await exchange(mockRequest, mockResponse)

    expect(mockExchangeCode).toHaveBeenCalledWith('test-code')
    expect(mockUpsertUserFromLinearToken).toHaveBeenCalledWith('access-token')
    expect(mockCreateRound).toHaveBeenCalledWith(mockUser)
    expect(mockCreateSession).toHaveBeenCalledWith(mockUser, mockRound)
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.CREATED)
    expect(mockResponse.json).toHaveBeenCalledWith({ accessToken: 'session-token' })
  })

  it('should throw an error if exchangeCode fails', async () => {
    const mockError = new Error('Exchange code failed')
    mockExchangeCode.mockRejectedValue(mockError)

    await expect(exchange(mockRequest, mockResponse)).rejects.toThrow('Exchange code failed')
  })

  it('should throw an error if upsertUserFromLinearToken fails', async () => {
    const mockError = new Error('Upsert user failed')
    mockUpsertUserFromLinearToken.mockRejectedValue(mockError)

    await expect(exchange(mockRequest, mockResponse)).rejects.toThrow('Upsert user failed')
  })

  it('should throw an error if createRound fails', async () => {
    const mockError = new Error('Create round failed')
    mockCreateRound.mockRejectedValue(mockError)

    await expect(exchange(mockRequest, mockResponse)).rejects.toThrow('Create round failed')
  })

  it('should throw an error if createSession fails', async () => {
    const mockError = new Error('Create session failed')
    mockCreateSession.mockRejectedValue(mockError)

    await expect(exchange(mockRequest, mockResponse)).rejects.toThrow('Create session failed')
  })
})
