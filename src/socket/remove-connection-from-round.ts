import { WebSocket } from 'ws'

import { roundConnections } from '@aces/socket/setup-websocket'


function removeConnectionFromRound(roundId: string, ws: WebSocket): void {
  roundConnections.get(roundId)?.delete(ws)
  if (roundConnections.get(roundId)?.size === 0) {
    roundConnections.delete(roundId)
  }
}

export default removeConnectionFromRound
