import { Response } from 'express'

import authorize, { IncomingAccessTokenRequest } from '@aces/services/auth/authorize'
import getOrCreateUser from '@aces/services/auth/get-or-create-user'


jest.mock('@aces/services/auth/exchange-code', () => jest.fn().mockReturnValue('123456'))
jest.mock('@aces/services/auth/get-or-create-user', () => jest.fn().mockReturnValue({ token: 'abcdef' }))
const mockGetOrCreateUser = getOrCreateUser as jest.Mock


describe('authorize', () => {
  it('should return an encrypted access token', async () => {
    const request = {
      body: {
        code: '123456',
      },
    } as unknown as IncomingAccessTokenRequest
    const json = jest.fn()
    const response = {
      status: jest.fn().mockReturnValue({ json }),
    } as unknown as Response
    await authorize(request, response)
    expect(response.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ accessToken: 'abcdef' })
  })

  it('should return an error message', async () => {
    const request = {
      body: {
        code: '123456',
      },
    } as unknown as IncomingAccessTokenRequest
    const json = jest.fn()
    const response = {
      status: jest.fn().mockReturnValue({ json }),
    } as unknown as Response
    const error = new Error('An error occurred')
    mockGetOrCreateUser.mockRejectedValue(error)
    jest.spyOn(console, 'error').mockImplementation(() => {})
    await authorize(request, response)
    expect(response.status).toHaveBeenCalledWith(500)
    expect(console.error).toHaveBeenCalledWith(error)
    expect(json).toHaveBeenCalledWith({ error: 'An error occurred' })
  })

  it('should return an error message if the response is not ok', async () => {
    const request = {
      body: {
        code: '123456',
      },
    } as unknown as IncomingAccessTokenRequest
    const json = jest.fn()
    const response = {
      status: jest.fn().mockReturnValue({ json }),
    } as unknown as Response
    const error = { response: { data: 'An error occurred' } }
    mockGetOrCreateUser.mockRejectedValue(error)
    jest.spyOn(console, 'error').mockImplementation(() => {})
    await authorize(request, response)
    expect(response.status).toHaveBeenCalledWith(500)
    expect(console.error).toHaveBeenCalledWith(error)
    expect(console.error).toHaveBeenCalledWith(error.response.data)
    expect(json).toHaveBeenCalledWith({ error: 'An error occurred' })
  })
})
