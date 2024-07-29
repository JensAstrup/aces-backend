import { Issue, PrismaClient } from '@prisma/client'

import createIssue from '@aces/services/issues/create-issue'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    issue: {
      create: jest.fn()
    }
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  }
})

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    issue: {
      create: jest.fn().mockResolvedValue({
        id: '123456',
        linearId: 'linear-123456',
      } as Issue)
    }
  }

  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
    User: jest.fn() // Mocking the User type
  }
})

describe('create Issue', () => {
  const mockPrismaClient = new PrismaClient() as unknown as {
      issue: {
        create: jest.Mock
      }
    }
  it('should create a new issue', async () => {
    const mockIssue = { id: 'test-issue-id', roundId: 'test-round-id', linearId: 'test-linear-id' }
    mockPrismaClient.issue.create.mockResolvedValue(mockIssue)

    const result = await createIssue('test-round-id', 'test-linear-id')

    expect(result).toEqual(mockIssue)
    expect(mockPrismaClient.issue.create).toHaveBeenCalledWith({
      data: {
        roundId: 'test-round-id',
        linearId: 'test-linear-id',
      }
    })
  })
})
