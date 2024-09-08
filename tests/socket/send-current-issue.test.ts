import { Issue } from '@linear/sdk'
import { PrismaClient, Round, Vote } from '@prisma/client'
import { WebSocket } from 'ws'

import { WebSocketCloseCode } from '@aces/common/WebSocketCodes'
import getLinearIssue from '@aces/linear/get-linear-issue'
import getIssueVotes from '@aces/services/issues/get-issue-votes'
import sendCurrentIssue from '@aces/socket/send-current-issue'
import sendMessageToRound from '@aces/socket/send-message-to-round'
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
      },
    },
  }
})

jest.mock('@aces/linear/get-linear-issue')
jest.mock('@aces/util/encryption/decrypt')
jest.mock('@aces/services/issues/get-issue-votes')
jest.mock('@aces/socket/send-message-to-round')

const mockGetLinearIssue = getLinearIssue as jest.MockedFunction<typeof getLinearIssue>
const mockDecrypt = decrypt as jest.MockedFunction<typeof decrypt>
const mockGetIssueVotes = getIssueVotes as jest.MockedFunction<typeof getIssueVotes>
const mockSendMessageToRound = sendMessageToRound as jest.MockedFunction<typeof sendMessageToRound>

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
    const mockIssueVotes = [{ value: 1 }, { value: 2 }] as Vote[]

    mockPrismaClient.round.findUnique.mockResolvedValue(mockRound)
    mockDecrypt.mockReturnValue('decrypted_token')
    mockGetIssueVotes.mockResolvedValue(mockIssueVotes)
    mockGetLinearIssue.mockResolvedValue(mockIssue)

    await sendCurrentIssue('round_123', mockWs)

    expect(mockDecrypt).toHaveBeenCalledWith('encrypted_token')
    expect(mockGetLinearIssue).toHaveBeenCalledWith('issue_123', 'decrypted_token')
    expect(mockSendMessageToRound).toHaveBeenCalledWith('round_123', { type: 'issue', payload: { issue: mockIssue, votes: [1, 2] }, event: 'response' })
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
    mockGetLinearIssue.mockResolvedValue(null)
    mockPrismaClient.round.findUnique.mockResolvedValue(mockRound)

    await sendCurrentIssue('round_without_issue', mockWs)

    expect(mockGetLinearIssue).not.toHaveBeenCalled()
    expect(mockSendMessageToRound).not.toHaveBeenCalled()
  })
})
