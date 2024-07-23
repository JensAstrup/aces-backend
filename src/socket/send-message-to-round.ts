import { WebSocket } from 'ws'

import { roundConnections } from '@aces/socket/setup-websocket'


function sendMessageToRound(roundId: string, message: unknown): void {
  const connections = roundConnections.get(roundId)

  if (connections && connections.size > 0) {
    connections.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
      else {
        console.log(`Client in round ${roundId} not ready. State: ${client.readyState}`)
      }
    })
  }
  else {
    console.log(`No active connections found for round ${roundId}`)
  }
}

export default sendMessageToRound
