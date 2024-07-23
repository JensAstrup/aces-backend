import { WebSocket } from 'ws'

import { roundConnections } from '@aces/socket/setup-websocket'


function addConnectionToRound(roundId: string, ws: WebSocket): void {
  if (!roundConnections.has(roundId)) {
    roundConnections.set(roundId, new Set())
    console.log(`Created new connection set for round: ${roundId}`)
  }
  roundConnections.get(roundId)?.add(ws)
}

export default addConnectionToRound
