import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { v7 as uuidv7 } from 'uuid'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import anonymousRegistration from '@aces/handlers/auth/anonymous-registration'
import encrypt from '@aces/util/encryption/encrypt'

// Mock dependencies
jest.mock('uuid')
jest.mock('@aces/util/encryption/encrypt')
const mockUuidv7 = uuidv7 as jest.MockedFunction<typeof uuidv7>
const mockEncrypt = encrypt as jest.MockedFunction<typeof encrypt>

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
      body: { roundId: 'test-round-id' }
    }
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    mockUuidv7.mockReturnValue('mock-uuid')
    mockEncrypt.mockReturnValue('encrypted-token')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new user and add them as a guest to the round', async () => {
    const mockUser = { id: 'test-user-id', token: 'encrypted-token' }
    mockPrismaClient.user.create.mockResolvedValue(mockUser)
    mockPrismaClient.round.update.mockResolvedValue({ id: 'test-round-id' })

    await anonymousRegistration(mockRequest as Request, mockResponse as Response)

    expect(uuidv7).toHaveBeenCalledTimes(1)
    expect(encrypt).toHaveBeenCalledWith('anonymous-mock-uuid')
    expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
      data: { token: 'encrypted-token' }
    })
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
