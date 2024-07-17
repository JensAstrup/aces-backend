import { CustomView } from '@linear/sdk'
import { Request, Response } from 'express'

import getViews from '@aces/handlers/views/get-views'
import getFavoriteViews from '@aces/services/views/get-favorite-views'


jest.mock('@aces/services/views/get-favorite-views')
const mockGetFavoriteViews = getFavoriteViews as jest.MockedFunction<typeof getFavoriteViews>

describe('getViews', () => {
  it('should return favorite views', async () => {
    const user = {
      token: '123'
    }
    const req = {
      user
    } as unknown as Request
    const res = {
      json: jest.fn()
    } as unknown as Response
    mockGetFavoriteViews.mockResolvedValue([{ id: '1', name: 'Issue' } as CustomView])
    await getViews(req, res)
    expect(mockGetFavoriteViews).toHaveBeenCalledWith(user)
    expect(res.json).toHaveBeenCalledWith([{ id: '1', name: 'Issue' }])
  })
})
