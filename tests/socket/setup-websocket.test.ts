import http from 'http'

import { WebSocket, WebSocketServer } from 'ws'

import createWebSocketServer from '@aces/socket/create'
import { handleNewConnection } from '@aces/socket/handle-new-connection'
import { roundConnections, setupWebSocket } from '@aces/socket/setup-websocket'


jest.mock('@aces/socket/create')
jest.mock('@aces/socket/handle-new-connection')

describe('setupWebSocket', () => {
  let mockServer: http.Server
  let mockWss: jest.Mocked<WebSocketServer>

  beforeEach(() => {
    mockServer = {} as http.Server
    mockWss = {
      on: jest.fn(),
    } as unknown as jest.Mocked<WebSocketServer>

    ;(createWebSocketServer as jest.Mock).mockReturnValue(mockWss)
  })

  afterEach(() => {
    jest.clearAllMocks()
    roundConnections.clear()
  })

  it('should create a WebSocket server', () => {
    setupWebSocket(mockServer)

    expect(createWebSocketServer).toHaveBeenCalledWith(mockServer)
  })

  it('should set up a connection listener', () => {
    setupWebSocket(mockServer)

    expect(mockWss.on).toHaveBeenCalledWith('connection', handleNewConnection)
  })

  it('should use the shared roundConnections map', () => {
    expect(roundConnections).toBeInstanceOf(Map)
    expect(roundConnections.size).toBe(0)
  })
})
