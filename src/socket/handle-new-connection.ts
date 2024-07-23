import http from 'http'
import url from 'url'

import { WebSocket } from 'ws'

import { WebSocketCloseCode } from '@aces/common/WebSocketCodes'
import addConnectionToRound from '@aces/socket/add-connection-to-round'
import sendCurrentIssue from '@aces/socket/send-current-issue'
import setupWebSocketListeners from '@aces/socket/setup-listeners'


export function handleNewConnection(ws: WebSocket, req: http.IncomingMessage): void {
  const parameters = url.parse(req.url as string, true)
  const roundId = parameters.query.roundId as string

  if (!roundId) {
    console.log('Closing connection: No roundId provided')
    ws.close(WebSocketCloseCode.POLICY_VIOLATION, 'RoundId is required')
    return
  }

  addConnectionToRound(roundId, ws)
  setupWebSocketListeners(ws, roundId)
  sendCurrentIssue(roundId, ws)
}
