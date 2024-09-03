import { Favorite } from '@linear/sdk'
import { User } from '@prisma/client'
import { Request, Response } from 'express'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import getViews from '@aces/handlers/views/get-views'
import getFavoriteViews from '@aces/services/views/get-favorite-views'


jest.mock('@aces/services/views/get-favorite-views')
const mockGetFavoriteViews = getFavoriteViews as jest.MockedFunction<typeof getFavoriteViews>

describe('getViews', () => {
  let req: Partial<Request>
  let res: Partial<Response>

  beforeEach(() => {
    req = {
      // @ts-expect-error We're not covering all properties of Request session
      session: {
        user: { token: '123' } as User
      }
    }
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    }
  })

  it('should return favorite views', async () => {
    const mockFavorites = [
      { customView: Promise.resolve({ id: '1', name: 'Issue' }) },
      { customView: Promise.resolve({ id: '2', name: 'Board' }) }
    ] as Favorite[]
    mockGetFavoriteViews.mockResolvedValue(mockFavorites)

    await getViews(req as Request, res as Response)

    expect(mockGetFavoriteViews).toHaveBeenCalledWith(req.session!.user)
    expect(res.json).toHaveBeenCalledWith([
      { id: '1', name: 'Issue' },
      { id: '2', name: 'Board' }
    ])
  })

  it('should handle null custom views', async () => {
    const mockFavorites = [
      { customView: Promise.resolve(null) },
      { customView: Promise.resolve({ id: '2', name: 'Board' }) }
    ] as Favorite[]
    mockGetFavoriteViews.mockResolvedValue(mockFavorites)

    await getViews(req as Request, res as Response)

    expect(mockGetFavoriteViews).toHaveBeenCalledWith(req.session!.user)
    expect(res.json).toHaveBeenCalledWith([
      null,
      { id: '2', name: 'Board' }
    ])
  })

  it('should return unauthorized if user is not present', async () => {
    req.session!.user = undefined

    await getViews(req as Request, res as Response)

    expect(res.status).toHaveBeenCalledWith(HttpStatusCodes.UNAUTHORIZED)
    expect(res.send).toHaveBeenCalledWith('Unauthorized')
  })
})
