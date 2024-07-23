import http from 'http'

import { WebSocketServer } from 'ws'

import createWebSocketServer from '@aces/socket/create'


jest.mock('ws', () => ({
  WebSocketServer: jest.fn().mockImplementation(() => ({
    on: jest.fn()
  }))
}))

const mockWebSocketServer = WebSocketServer as unknown as jest.Mock

describe('createWebSocketServer', () => {
  let mockServer: http.Server
  let consoleSpy: jest.SpyInstance
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    mockServer = {} as http.Server
    consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('should create a new WebSocketServer', () => {
    const wss = createWebSocketServer(mockServer)

    expect(WebSocketServer).toHaveBeenCalledWith({ server: mockServer }, expect.any(Function))
    expect(wss).toBeDefined()
    expect(wss.on).toHaveBeenCalledWith('error', expect.any(Function))
  })

  it('should log when the WebSocket server is ready', () => {
    createWebSocketServer(mockServer)

    // Call the callback passed to WebSocketServer constructor
    const callback = mockWebSocketServer.mock.calls[0][1]
    callback()

    expect(consoleSpy).toHaveBeenCalledWith('WebSocket server is ready')
  })

  it('should log when the WebSocket server is started', () => {
    createWebSocketServer(mockServer)

    expect(consoleSpy).toHaveBeenCalledWith('WebSocket server started')
  })

  it('should set up error handling', () => {
    const wss = createWebSocketServer(mockServer)

    // Simulate an error
    const errorHandler = (wss.on as jest.Mock).mock.calls.find(call => call[0] === 'error')[1]
    const testError = new Error('Test error')
    errorHandler(testError)

    expect(consoleErrorSpy).toHaveBeenCalledWith('WebSocket server error:', testError)
  })
})
