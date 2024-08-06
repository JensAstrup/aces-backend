import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

import disconnect from '@aces/handlers/auth/disconnect'
import endRound from '@aces/services/auth/end-round'
import removeGuestFromRound from '@aces/services/auth/remove-guest-from-round'
import canAccessRound from '@aces/util/can-access-round'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
    },
    round: {
      findUnique: jest.fn(),
    }
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  }
})


jest.mock('@aces/util/can-access-round')
jest.mock('@aces/services/auth/end-round')
jest.mock('@aces/services/auth/remove-guest-from-round')

const mockCanAccessRound = canAccessRound as jest.MockedFunction<typeof canAccessRound>
const mockEndRound = endRound as jest.MockedFunction<typeof endRound>
const mockRemoveGuestFromRound = removeGuestFromRound as jest.MockedFunction<typeof removeGuestFromRound>


describe('disconnect', () => {
  let mockPrismaClient: {
    user: {
      findUnique: jest.Mock
    }
    round: {
      findUnique: jest.Mock
    }
  }

  beforeEach(() => {
    mockPrismaClient = new PrismaClient() as unknown as {
        user: {
            findUnique: jest.Mock
        }
        round: {
            findUnique: jest.Mock
        }
    }
    jest.clearAllMocks()
  })

  it('should return 401 if user is not found', async () => {
    const mockRequest = {
      headers: {
        authorization: 'test-token'
      }
    } as Request
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as Response
    mockPrismaClient.user.findUnique.mockResolvedValue(null)
    await disconnect(mockRequest, mockResponse)
    expect(mockResponse.status).toHaveBeenCalledWith(401)
    expect(mockResponse.send).toHaveBeenCalledWith('Unauthorized')
    expect(mockPrismaClient.round.findUnique).not.toHaveBeenCalled()
  })


  it('should return 404 if round is not found', async () => {
    const mockRequest = {
      headers: {
        authorization: 'test-token'
      },
      body: {
        roundId: 'test-round-id'
      }
    } as unknown as Request
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as Response
    mockPrismaClient.user.findUnique.mockResolvedValue({})
    mockPrismaClient.round.findUnique.mockResolvedValue(null)
    await disconnect(mockRequest, mockResponse)
    expect(mockResponse.status).toHaveBeenCalledWith(404)
    expect(mockResponse.send).toHaveBeenCalledWith('Round not found')
    expect(mockCanAccessRound).not.toHaveBeenCalled()
  })

  it('should return 403 if user does not have access to round', async () => {
    const mockRequest = {
      headers: {
        authorization: 'test-token'
      },
      body: {
        roundId: 'test-round-id'
      }
    } as unknown as Request
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as Response
    mockPrismaClient.user.findUnique.mockResolvedValue({})
    mockPrismaClient.round.findUnique.mockResolvedValue({})
    mockCanAccessRound.mockResolvedValue(false)
    await disconnect(mockRequest, mockResponse)
    expect(mockResponse.status).toHaveBeenCalledWith(403)
    expect(mockResponse.send).toHaveBeenCalledWith('Forbidden')
    expect(mockEndRound).not.toHaveBeenCalled()
    expect(mockRemoveGuestFromRound).not.toHaveBeenCalled()
  })

  it('should end round if user is creator', async () => {
    const mockRequest = {
      headers: {
        authorization: 'test-token'
      },
      body: {
        roundId: 'test-round-id'
      }
    } as unknown as Request
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as Response
    mockPrismaClient.user.findUnique.mockResolvedValue({ id: 'test-user-id' })
    mockPrismaClient.round.findUnique.mockResolvedValue({ creatorId: 'test-user-id' })
    mockCanAccessRound.mockResolvedValue(true)
    await disconnect(mockRequest, mockResponse)
    expect(mockResponse.status).toHaveBeenCalledWith(204)
    expect(mockResponse.send).toHaveBeenCalledWith()
    expect(mockEndRound).toHaveBeenCalledWith({ creatorId: 'test-user-id' })
    expect(mockRemoveGuestFromRound).not.toHaveBeenCalled()
  })

  it('should remove guest from round if user is not creator', async () => {
    const mockRequest = {
      headers: {
        authorization: 'test-token'
      },
      body: {
        roundId: 'test-round-id'
      }
    } as unknown as Request
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as unknown as Response
    mockPrismaClient.user.findUnique.mockResolvedValue({})
    mockPrismaClient.round.findUnique.mockResolvedValue({ creatorId: 'another-user-id' })
    mockCanAccessRound.mockResolvedValue(true)
    await disconnect(mockRequest, mockResponse)
    expect(mockResponse.status).toHaveBeenCalledWith(204)
    expect(mockResponse.send).toHaveBeenCalled()
    expect(mockEndRound).not.toHaveBeenCalled()
    expect(mockRemoveGuestFromRound).toHaveBeenCalledWith({ creatorId: 'another-user-id' }, {})
  })
})
