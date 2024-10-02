import { WebSocket } from 'ws'

import { roundConnections } from '@aces/socket/setup-websocket'


/**
 * Adds a WebSocket connection to the specified round.
 *
 * @param {string} roundId - The unique identifier of the round.
 * @param {WebSocket} ws - The WebSocket connection to be added.
 * @return {boolean} - Returns true if the connection was successfully added, false if it already exists.
 */
function addConnectionToRound(roundId: string, ws: WebSocket): boolean {
  if (!roundConnections.has(roundId)) {
    roundConnections.set(roundId, new Set())
    console.log(`Created new connection set for round: ${roundId}`)
  }
  const roundConnection = roundConnections.get(roundId)
  if (roundConnection) {
    if (!roundConnection.has(ws)) {
      roundConnection.add(ws)
      return true
    }
  }
  return false
}

export default addConnectionToRound
