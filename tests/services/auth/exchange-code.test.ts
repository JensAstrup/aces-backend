import axios from 'axios'
import qs from 'qs'

import exchangeCode from '@aces/services/auth/exchange-code'


jest.mock('axios', () => ({ post: jest.fn() }))
const mockAxios = axios as jest.Mocked<typeof axios>


describe('exchangeCode', () => {
  it('should return an access token', async () => {
    const post = jest.fn().mockResolvedValue({ data: { access_token: 'abcdef' } })
    mockAxios.post.mockImplementation(post)
    const accessToken = await exchangeCode('123456')
    expect(accessToken).toEqual('abcdef')
    const expectedQuery = qs.stringify({
      client_id: process.env.LINEAR_CLIENT_ID,
      client_secret: process.env.LINEAR_CLIENT_SECRET,
      code: '123456',
      grant_type: 'authorization_code',
      redirect_uri: process.env.LINEAR_REDIRECT_URI,
    })
    expect(post).toHaveBeenCalledWith('https://api.linear.app/oauth/token', expectedQuery, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  })
})
