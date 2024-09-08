import { Response } from 'express'

import authorize, { IncomingAccessTokenRequest } from '@aces/handlers/auth/authorize'
import { createUser } from '@aces/services/auth/get-or-create-user'


jest.mock('@aces/services/auth/exchange-code', () => jest.fn().mockReturnValue('123456'))
jest.mock('@aces/services/auth/get-or-create-user', () => {
  return {
    createUser: jest.fn().mockResolvedValue({ token: 'abcdef' })
  }
})
const mockCreateUser = createUser as jest.Mock


describe('authorize', () => {
  it('should return an encrypted access token', async () => {
    const request = {
      body: {
        code: '123456',
      },
      session: {}
    } as unknown as IncomingAccessTokenRequest
    const json = jest.fn()
    const response = {
      status: jest.fn().mockReturnValue({ json, send: jest.fn() }),
    } as unknown as Response
    await authorize(request, response)
    expect(response.status).toHaveBeenCalledWith(204)
    expect(request.session.user).toEqual({ token: 'abcdef' })
    expect(request.session.anonymous).toBe(false)
  })

  it('should return an error message', async () => {
    const request = {
      body: {
        code: '123456',
      },
      session: {}
    } as unknown as IncomingAccessTokenRequest
    const json = jest.fn()
    const response = {
      status: jest.fn().mockReturnValue({ json }),
    } as unknown as Response
    const error = new Error('An error occurred')
    mockCreateUser.mockRejectedValue(error)
    jest.spyOn(console, 'error').mockImplementation(() => {})
    await expect(authorize(request, response)).rejects.toThrow(error)
  })
})
