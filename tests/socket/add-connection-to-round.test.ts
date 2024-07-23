import { WebSocket } from 'ws'

import addConnectionToRound from '@aces/socket/add-connection-to-round'
import { roundConnections } from '@aces/socket/setup-websocket'


jest.mock('@aces/socket/setup-websocket', () => ({
  roundConnections: new Map()
}))

describe('addConnectionToRound', () => {
  let mockWs: WebSocket
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    mockWs = {} as WebSocket
    consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    roundConnections.clear()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('should create a new Set for a new roundId', () => {
    const roundId = 'round1'

    addConnectionToRound(roundId, mockWs)

    expect(roundConnections.has(roundId)).toBe(true)
    expect(roundConnections.get(roundId)).toBeInstanceOf(Set)
    expect(consoleSpy).toHaveBeenCalledWith(`Created new connection set for round: ${roundId}`)
  })

  it('should add the WebSocket to an existing round', () => {
    const roundId = 'round2'
    const existingWs = {} as WebSocket
    roundConnections.set(roundId, new Set([existingWs]))

    addConnectionToRound(roundId, mockWs)

    const connections = roundConnections.get(roundId)
    expect(connections?.size).toBe(2)
    expect(connections?.has(existingWs)).toBe(true)
    expect(connections?.has(mockWs)).toBe(true)
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('should handle multiple additions to the same round', () => {
    const roundId = 'round3'
    const ws1 = {} as WebSocket
    const ws2 = {} as WebSocket
    const ws3 = {} as WebSocket

    addConnectionToRound(roundId, ws1)
    addConnectionToRound(roundId, ws2)
    addConnectionToRound(roundId, ws3)

    const connections = roundConnections.get(roundId)
    expect(connections?.size).toBe(3)
    expect(connections?.has(ws1)).toBe(true)
    expect(connections?.has(ws2)).toBe(true)
    expect(connections?.has(ws3)).toBe(true)
    expect(consoleSpy).toHaveBeenCalledTimes(1)
  })

  it('should not create duplicate entries for the same WebSocket', () => {
    const roundId = 'round4'

    addConnectionToRound(roundId, mockWs)
    addConnectionToRound(roundId, mockWs)

    const connections = roundConnections.get(roundId)
    expect(connections?.size).toBe(1)
    expect(connections?.has(mockWs)).toBe(true)
  })
})
