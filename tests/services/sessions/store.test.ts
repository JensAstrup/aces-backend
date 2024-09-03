import { PrismaClient, Session } from '@prisma/client'
import { SessionData } from 'express-session'

import PrismaSessionStore from '@aces/services/sessions/store'

// Mock the entire @prisma/client module
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    session: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  }
  return { PrismaClient: jest.fn(() => mockPrismaClient) }
})

describe('PrismaSessionStore', () => {
  let store: PrismaSessionStore
  let mockPrismaClient: jest.Mocked<PrismaClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockPrismaClient = new PrismaClient() as jest.Mocked<PrismaClient>
    store = new PrismaSessionStore()
  })

  describe('get', () => {
    it('should retrieve a session by ID', async () => {
      // @ts-expect-error We don't need a full Session object
      const mockSession: Session = {
        id: 'sessionId',
        data: JSON.stringify({ user: { id: 'userId' } }),
        userId: 'userId',
        expiresAt: new Date(),
      }
      jest.spyOn(mockPrismaClient.session, 'findUnique').mockResolvedValue(mockSession)

      const callback = jest.fn()
      await store.get('sessionId', callback)

      expect(mockPrismaClient.session.findUnique).toHaveBeenCalledWith({ where: { id: 'sessionId' } })
      expect(callback).toHaveBeenCalledWith(null, { user: { id: 'userId' } })
    })

    it('should return null if session is not found', async () => {
      jest.spyOn(mockPrismaClient.session, 'findUnique').mockResolvedValue(null)

      const callback = jest.fn()
      await store.get('sessionId', callback)

      expect(mockPrismaClient.session.findUnique).toHaveBeenCalledWith({ where: { id: 'sessionId' } })
      expect(callback).toHaveBeenCalledWith(null, null)
    })

    it('should handle errors', async () => {
      const error = new Error('Database error')
      jest.spyOn(mockPrismaClient.session, 'findUnique').mockRejectedValue(error)

      const callback = jest.fn()
      await store.get('sessionId', callback)

      expect(callback).toHaveBeenCalledWith(error)
    })
  })

  describe('set', () => {
    it('should create or update a session', async () => {
      // @ts-expect-error We don't need a full Session object
      const sessionData: SessionData = { cookie: { expires: new Date() }, user: { id: 'userId' } }
      jest.spyOn(mockPrismaClient.session, 'upsert').mockResolvedValue({} as Session)

      const callback = jest.fn()
      await store.set('sessionId', sessionData, callback)

      expect(mockPrismaClient.session.upsert).toHaveBeenCalledWith({
        where: { id: 'sessionId' },
        update: {
          data: JSON.stringify(sessionData),
          userId: 'userId',
          expiresAt: expect.any(Date),
        },
        create: {
          id: 'sessionId',
          data: JSON.stringify(sessionData),
          userId: 'userId',
          expiresAt: expect.any(Date),
        },
      })
      expect(callback).toHaveBeenCalledWith()
    })

    it('should handle errors', async () => {
      // @ts-expect-error We don't need a full Session object
      const sessionData: SessionData = { cookie: { expires: new Date() }, user: { id: 'userId' } }
      const error = new Error('Database error')
      jest.spyOn(mockPrismaClient.session, 'upsert').mockRejectedValue(error)

      const callback = jest.fn()
      await store.set('sessionId', sessionData, callback)

      expect(callback).toHaveBeenCalledWith(error)
    })
  })

  describe('destroy', () => {
    it('should delete a session by ID', async () => {
      jest.spyOn(mockPrismaClient.session, 'delete').mockResolvedValue({} as Session)

      const callback = jest.fn()
      await store.destroy('sessionId', callback)

      expect(mockPrismaClient.session.delete).toHaveBeenCalledWith({ where: { id: 'sessionId' } })
      expect(callback).toHaveBeenCalledWith()
    })

    it('should handle errors', async () => {
      const error = new Error('Database error')
      jest.spyOn(mockPrismaClient.session, 'delete').mockRejectedValue(error)

      const callback = jest.fn()
      await store.destroy('sessionId', callback)

      expect(callback).toHaveBeenCalledWith(error)
    })
  })
})
