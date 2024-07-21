import { User } from '@prisma/client'
import { Request, Response } from 'express'

import setUser from '@aces/middleware/set-user'
import getOrCreateUser from '@aces/services/auth/get-or-create-user'


jest.mock('@aces/services/auth/get-or-create-user')
const mockGetOrCreateUser = getOrCreateUser as jest.MockedFunction<typeof getOrCreateUser>

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
    mockGetOrCreateUser.mockResolvedValue(user)
    await setUser(req, res, next)
    expect(req.user).toEqual(user)
    expect(mockGetOrCreateUser).toHaveBeenCalledWith('123', true)
    expect(next).toHaveBeenCalled()
  })
})
