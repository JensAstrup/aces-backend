import { User } from '@prisma/client'
import { Request, Response } from 'express'
import { SessionData } from 'express-session'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import getCurrentUser from '@aces/handlers/auth/current-user'


describe('getCurrentUser', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let jsonMock: jest.Mock

  beforeEach(() => {
    jsonMock = jest.fn()
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jsonMock,
    }
  })

  it('should return unauthorized when session and anonymous are undefined', () => {
    mockRequest = {
      session: {} as unknown as SessionData,
    }

    getCurrentUser(mockRequest as Request, mockResponse as Response)

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.UNAUTHORIZED)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' })
  })

  it('should return user data without token when user is defined', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      token: 'secret-token',
    } as unknown as User

    mockRequest = {
      session: {
        user: mockUser,
      } as unknown as SessionData,
    }

    getCurrentUser(mockRequest as Request, mockResponse as Response)

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.OK)
    expect(jsonMock).toHaveBeenCalledWith({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
    })
  })
})
