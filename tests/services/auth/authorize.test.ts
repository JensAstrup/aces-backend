import { Response } from 'express'

import authorize, { IncomingAccessTokenRequest } from '@aces/services/auth/authorize'
import encrypt from '@aces/util/encryption/encrypt'


jest.mock('@aces/services/auth/exchange-code', () => jest.fn().mockReturnValue('123456'))
jest.mock('@aces/util/encryption/encrypt')
const mockEncrypt = encrypt as jest.Mock

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
    mockEncrypt.mockReturnValue('abcdef')
    await authorize(request, response)
    expect(response.status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ accessToken: 'abcdef' })
  })
})
