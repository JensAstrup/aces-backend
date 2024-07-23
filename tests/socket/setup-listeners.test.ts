import { WebSocket } from 'ws'

import removeConnectionFromRound from '@aces/socket/remove-connection-from-round'
import setupWebSocketListeners from '@aces/socket/setup-listeners'


jest.mock('@aces/socket/remove-connection-from-round', () => jest.fn())

describe('setupWebSocketListeners', () => {
  let mockWebSocket: jest.Mocked<WebSocket>

  beforeEach(() => {
    mockWebSocket = {
      on: jest.fn()
    } as unknown as jest.Mocked<WebSocket>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set up error listener', () => {
    setupWebSocketListeners(mockWebSocket, 'round-1')

    const errorCallback = (mockWebSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'error')[1]

    const error = new Error('Test error')
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    errorCallback(error)

    expect(consoleSpy).toHaveBeenCalledWith('WebSocket error:', error)
  })

  it('should set up close listener', () => {
    setupWebSocketListeners(mockWebSocket, 'round-1')

    const closeCallback = (mockWebSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'close')[1]

    const code = 1000
    const reason = 'Normal closure'
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    closeCallback(code, reason)

    expect(consoleSpy).toHaveBeenCalledWith(`WebSocket closed. Code: ${code}, Reason: ${reason}`)
    expect(removeConnectionFromRound).toHaveBeenCalledWith('round-1', mockWebSocket)
  })

  it('should set up message listener', () => {
    setupWebSocketListeners(mockWebSocket, 'round-1')

    const messageCallback = (mockWebSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'message')[1]

    const message = 'Test message'
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    messageCallback(message)

    expect(consoleSpy).toHaveBeenCalledWith(`Received message from round round-1: ${message}`)
  })

  it('should call all event listeners when they are triggered', () => {
    setupWebSocketListeners(mockWebSocket, 'round-1')

    const errorCallback = (mockWebSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'error')[1]
    const closeCallback = (mockWebSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'close')[1]
    const messageCallback = (mockWebSocket.on as jest.Mock).mock.calls.find(call => call[0] === 'message')[1]

    const error = new Error('Test error')
    const code = 1000
    const reason = 'Normal closure'
    const message = 'Test message'

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    errorCallback(error)
    closeCallback(code, reason)
    messageCallback(message)

    expect(consoleErrorSpy).toHaveBeenCalledWith('WebSocket error:', error)
    expect(consoleLogSpy).toHaveBeenCalledWith(`WebSocket closed. Code: ${code}, Reason: ${reason}`)
    expect(consoleLogSpy).toHaveBeenCalledWith(`Received message from round round-1: ${message}`)
    expect(removeConnectionFromRound).toHaveBeenCalledWith('round-1', mockWebSocket)
  })
})
