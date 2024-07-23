import http from 'http'

import { WebSocketServer } from 'ws'


function createWebSocketServer(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server }, () => {
    console.log('WebSocket server is ready')
  })
  wss.on('error', (error: Error) => {
    console.error('WebSocket server error:', error)
  })
  console.log('WebSocket server started')
  return wss
}

export default createWebSocketServer
