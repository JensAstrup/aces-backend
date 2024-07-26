import { Issue } from '@linear/sdk'
import { PrismaClient, Round } from '@prisma/client'
import { WebSocket } from 'ws'

import { WebSocketCloseCode } from '@aces/common/WebSocketCodes'
import getLinearIssue from '@aces/linear/get-linear-issue'
import sendCurrentIssue from '@aces/socket/send-current-issue'
import decrypt from '@aces/util/encryption/decrypt'


jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    round: {
      findUnique: jest.fn(),
    },
  }
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    Prisma: {
      PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
        constructor(message: string, { code }: { code: string }) {
          super(message)
          this.name = 'PrismaClientKnownRequestError'
          this.code = code
        }

        code: string
      },
    },
  }
})

jest.mock('@aces/linear/get-linear-issue')
jest.mock('@aces/util/encryption/decrypt')

const mockGetIssue = getLinearIssue as jest.MockedFunction<typeof getLinearIssue>
const mockDecrypt = decrypt as jest.MockedFunction<typeof decrypt>

describe('sendCurrentIssue', () => {
  let mockWs: jest.Mocked<WebSocket>
  let consoleSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance
  const mockPrismaClient = new PrismaClient() as unknown as {
    round: {
      findUnique: jest.MockedFunction<typeof PrismaClient.prototype.round.findUnique>
    }
  }

  beforeEach(() => {
    mockWs = {
      close: jest.fn(),
      send: jest.fn()
    } as unknown as jest.Mocked<WebSocket>

    consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('should send the current issue when found', async () => {
    const mockRound = {
      creator: { token: 'encrypted_token' },
      currentIssue: { linearId: 'issue_123' }
    } as unknown as Round
    const mockIssue = { id: 'issue_123', title: 'Test Issue' } as Issue

    mockPrismaClient.round.findUnique.mockResolvedValue(mockRound)
    mockDecrypt.mockReturnValue('decrypted_token')
    mockGetIssue.mockResolvedValue(mockIssue)

    await sendCurrentIssue('round_123', mockWs)

    // expect(mockPrismaClient.round.findUnique).toHaveBeenCalledWith({
    //   where: { id: 'round_123' },
    //   include: { creator: true, currentIssue: true }
    // })
    expect(mockDecrypt).toHaveBeenCalledWith('encrypted_token')
    expect(mockGetIssue).toHaveBeenCalledWith('issue_123', 'decrypted_token')
    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(mockIssue))
    expect(consoleSpy).toHaveBeenCalledWith('Sending current issue for round round_123')
  })

  it('should close the connection if round is not found', async () => {
    mockPrismaClient.round.findUnique.mockResolvedValue(null)

    await sendCurrentIssue('non_existent_round', mockWs)

    expect(consoleErrorSpy).toHaveBeenCalledWith('Round not found: non_existent_round')
    expect(mockWs.close).toHaveBeenCalledWith(WebSocketCloseCode.POLICY_VIOLATION, 'Round not found')
  })

  it('should handle round without current issue', async () => {
    const mockRound = {
      creator: { token: 'encrypted_token' },
      currentIssue: null
    } as unknown as Round

    mockPrismaClient.round.findUnique.mockResolvedValue(mockRound)

    await sendCurrentIssue('round_without_issue', mockWs)

    expect(mockGetIssue).not.toHaveBeenCalled()
    expect(mockWs.send).not.toHaveBeenCalled()
  })
})
