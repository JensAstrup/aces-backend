import { User } from '@prisma/client'
import { Request, Response } from 'express'

import setUser from '@aces/middleware/set-user'
import getUser from '@aces/services/auth/get-or-create-user'


jest.mock('@aces/services/auth/get-or-create-user')
const mockGetUser = getUser as jest.MockedFunction<typeof getUser>

describe('setUser', () => {
  it('should set user on request', async () => {
    const user = {
      token: '123'
    } as User
    const req = {
      headers: {
        authorization: '123'
      }
    } as unknown as Request
    const res = {} as Response
    const next = jest.fn()
    mockGetUser.mockResolvedValue(user)
    await setUser(req, res, next)
    expect(req.user).toEqual(user)
    expect(mockGetUser).toHaveBeenCalledWith('123')
    expect(next).toHaveBeenCalled()
  })
})
