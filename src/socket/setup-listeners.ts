import { WebSocket } from 'ws'

import removeConnectionFromRound from '@aces/socket/remove-connection-from-round'


function setupWebSocketListeners(ws: WebSocket, roundId: string): void {
  ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error)
  })

  ws.on('close', (code: number, reason: string) => {
    console.log(`WebSocket closed. Code: ${code}, Reason: ${reason}`)
    removeConnectionFromRound(roundId, ws)
  })

  ws.on('message', (message: string) => {
    console.log(`Received message from round ${roundId}: ${message}`)
    // Handle incoming messages if needed
  })
}

export default setupWebSocketListeners
