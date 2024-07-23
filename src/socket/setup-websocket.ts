import http from 'http'

import { WebSocket } from 'ws'

import createWebSocketServer from '@aces/socket/create'
import { handleNewConnection } from '@aces/socket/handle-new-connection'


export const roundConnections: Map<string, Set<WebSocket>> = new Map()

export function setupWebSocket(server: http.Server): void {
  const wss = createWebSocketServer(server)
  wss.on('connection', handleNewConnection)
}
