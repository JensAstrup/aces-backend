import http from 'http'
import url from 'url'

import { WebSocket } from 'ws'

import { WebSocketCloseCode } from '@aces/common/WebSocketCodes'
import addConnectionToRound from '@aces/socket/add-connection-to-round'
import { handleNewConnection } from '@aces/socket/handle-new-connection'
import sendCurrentIssue from '@aces/socket/send-current-issue'
import setupWebSocketListeners from '@aces/socket/setup-listeners'


jest.mock('url')
jest.mock('@aces/socket/add-connection-to-round')
jest.mock('@aces/socket/send-current-issue')
jest.mock('@aces/socket/setup-listeners')

const mockAddConnectionToRound = addConnectionToRound as jest.MockedFunction<typeof addConnectionToRound>

describe('handleNewConnection', () => {
  let mockWs: WebSocket
  let mockReq: http.IncomingMessage
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    mockWs = {
      close: jest.fn()
    } as unknown as jest.Mocked<WebSocket>

    mockReq = {
      url: 'ws://example.com?roundId=123'
    } as unknown as http.IncomingMessage

    consoleSpy = jest.spyOn(console, 'log').mockImplementation()

    ;(url.parse as jest.Mock).mockReturnValue({
      query: { roundId: '123' }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    consoleSpy.mockRestore()
  })

  it('should handle a new connection with a valid roundId', () => {
    mockAddConnectionToRound.mockReturnValue(true)
    handleNewConnection(mockWs, mockReq)

    expect(mockAddConnectionToRound).toHaveBeenCalledWith('123', mockWs)
    expect(setupWebSocketListeners).toHaveBeenCalledWith(mockWs, '123')
    expect(sendCurrentIssue).toHaveBeenCalledWith('123', mockWs)
  })

  it('should handle an existing connection with a valid roundId', () => {
    mockAddConnectionToRound.mockReturnValue(false)
    handleNewConnection(mockWs, mockReq)

    expect(mockAddConnectionToRound).toHaveBeenCalledWith('123', mockWs)
    expect(setupWebSocketListeners).toHaveBeenCalledWith(mockWs, '123')
    expect(sendCurrentIssue).not.toHaveBeenCalled()
  })

  it('should close the connection if no roundId is provided', () => {
    (url.parse as jest.Mock).mockReturnValue({
      query: {}
    })

    handleNewConnection(mockWs, mockReq)

    expect(consoleSpy).toHaveBeenCalledWith('Closing connection: No roundId provided')
    expect(mockWs.close).toHaveBeenCalledWith(WebSocketCloseCode.POLICY_VIOLATION, 'RoundId is required')
    expect(addConnectionToRound).not.toHaveBeenCalled()
    expect(setupWebSocketListeners).not.toHaveBeenCalled()
    expect(sendCurrentIssue).not.toHaveBeenCalled()
  })

  it('should handle different roundIds', () => {
    (url.parse as jest.Mock).mockReturnValue({
      query: { roundId: '456' }
    })
    mockAddConnectionToRound.mockReturnValue(true)

    handleNewConnection(mockWs, mockReq)

    expect(addConnectionToRound).toHaveBeenCalledWith('456', mockWs)
    expect(setupWebSocketListeners).toHaveBeenCalledWith(mockWs, '456')
    expect(sendCurrentIssue).toHaveBeenCalledWith('456', mockWs)
  })
})
