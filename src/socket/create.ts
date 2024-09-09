import http from 'http'

import * as Sentry from '@sentry/node'
import { WebSocketServer } from 'ws'


function createWebSocketServer(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server }, () => {
    console.log('WebSocket server is ready')
  })
  wss.on('error', (error: Error) => {
    Sentry.captureException(error)
  })
  console.log('WebSocket server started')
  return wss
}

export default createWebSocketServer
