import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { v7 as uuidv7 } from 'uuid'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import anonymousRegistration from '@aces/handlers/auth/anonymous-registration'
import encrypt from '@aces/util/encryption/encrypt'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      create: jest.fn().mockResolvedValue({
        id: '123456',
        token: 'abcdef'
      })
    },
    round: {
      update: jest.fn()
    }
  }

  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
    User: jest.fn() // Mocking the User type
  }
})

describe('anonymousRegistration', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  const mockPrismaClient = new PrismaClient() as unknown as {
    user: {
      create: jest.Mock
    }
      round: {
        update: jest.Mock
    }
  }

  beforeEach(() => {
    mockRequest = {
      // @ts-expect-error We're just mocking the properties we need
      session: {},
      body: { roundId: 'test-round-id' }
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new user and add them as a guest to the round', async () => {
    const mockUser = { id: 'test-user-id' }
    mockPrismaClient.user.create.mockResolvedValue(mockUser)
    mockPrismaClient.round.update.mockResolvedValue({ id: 'test-round-id' })

    await anonymousRegistration(mockRequest as Request, mockResponse as Response)

    expect(mockPrismaClient.user.create).toHaveBeenCalledWith({ data: { } })
    expect(mockPrismaClient.round.update).toHaveBeenCalledWith({
      where: { id: 'test-round-id' },
      data: {
        guests: {
          create: { userId: 'test-user-id' }
        }
      }
    })
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatusCodes.CREATED)
    expect(mockResponse.json).toHaveBeenCalledWith({ user: mockUser })
  })
})
