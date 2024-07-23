import { WebSocket } from 'ws'

import sendMessageToRound from '@aces/socket/send-message-to-round'
import { roundConnections } from '@aces/socket/setup-websocket'



jest.mock('@aces/socket/setup-websocket', () => ({
  roundConnections: new Map<string, Set<WebSocket>>()
}))

describe('sendMessageToRound', () => {
  const createMockWebSocket = (readyState: number): jest.Mocked<WebSocket> => {
    return {
      readyState,
      send: jest.fn(),
      close: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      terminate: jest.fn()
    } as unknown as jest.Mocked<WebSocket>
  }

  afterEach(() => {
    jest.clearAllMocks()
    roundConnections.clear()
  })

  it('should send message to all open connections', () => {
    const roundId = 'round-1'
    const message = { text: 'Hello, World!' }
    const mockWebSocket = createMockWebSocket(WebSocket.OPEN)

    roundConnections.set(roundId, new Set([mockWebSocket]))

    sendMessageToRound(roundId, message)

    expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message))
  })

  it('should not send message if connection is not open', () => {
    const roundId = 'round-2'
    const mockWebSocket = createMockWebSocket(WebSocket.CLOSED)

    roundConnections.set(roundId, new Set([mockWebSocket]))

    sendMessageToRound(roundId, { text: 'Hello, World!' })

    expect(mockWebSocket.send).not.toHaveBeenCalled()
  })

  it('should log message if no active connections are found', () => {
    const roundId = 'round-3'
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    sendMessageToRound(roundId, { text: 'Hello, World!' })

    expect(consoleSpy).toHaveBeenCalledWith(`No active connections found for round ${roundId}`)
  })

  it('should log message if client is not ready', () => {
    const roundId = 'round-4'
    const mockWebSocket = createMockWebSocket(WebSocket.CONNECTING)
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    roundConnections.set(roundId, new Set([mockWebSocket]))

    sendMessageToRound(roundId, { text: 'Hello, World!' })

    expect(consoleSpy).toHaveBeenCalledWith(`Client in round ${roundId} not ready. State: ${mockWebSocket.readyState}`)
  })
})
