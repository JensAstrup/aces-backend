import { WebSocket } from 'ws'

import removeConnectionFromRound from '@aces/socket/remove-connection-from-round'
import { roundConnections } from '@aces/socket/setup-websocket'

// Mock the roundConnections map
jest.mock('@aces/socket/setup-websocket', () => ({
  roundConnections: new Map<string, Set<WebSocket>>()
}))

describe('removeConnectionFromRound', () => {
  let mockWebSocket: WebSocket
  let mockRoundId: string

  beforeEach(() => {
    mockWebSocket = new WebSocket('ws://localhost')
    mockRoundId = 'test-round-id'

    roundConnections.clear()
  })

  it('should remove the WebSocket from the roundConnections set', () => {
    roundConnections.set(mockRoundId, new Set([mockWebSocket]))

    removeConnectionFromRound(mockRoundId, mockWebSocket)

    expect(roundConnections.get(mockRoundId)?.has(mockWebSocket)).toBe(undefined)
  })

  it('should delete the roundId from the roundConnections map if the set is empty', () => {
    roundConnections.set(mockRoundId, new Set([mockWebSocket]))

    removeConnectionFromRound(mockRoundId, mockWebSocket)

    expect(roundConnections.has(mockRoundId)).toBe(false)
  })

  it('should not throw an error if the roundId does not exist in the map', () => {
    expect(roundConnections.has(mockRoundId)).toBe(false)

    expect(() => {
      removeConnectionFromRound(mockRoundId, mockWebSocket)
    }).not.toThrow()
  })

  it('should not throw an error if the WebSocket does not exist in the set', () => {
    roundConnections.set(mockRoundId, new Set())

    expect(() => {
      removeConnectionFromRound(mockRoundId, mockWebSocket)
    }).not.toThrow()
  })
})
