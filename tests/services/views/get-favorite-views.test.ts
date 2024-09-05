import { LinearClient } from '@linear/sdk'
import { User } from '@prisma/client'

import getFavoriteViews from '@aces/services/views/get-favorite-views'
import decrypt from '@aces/util/encryption/decrypt'


jest.mock('@linear/sdk', () => {
  return {
    LinearClient: jest.fn(() => {
      return {
        favorites: jest.fn(() => {
          return {
            nodes: [
              {
                type: 'customView'
              }
            ]
          }
        })
      }
    })
  }
})
jest.mock('@aces/util/encryption/decrypt', () => {
  return jest.fn(() => 'decrypted-token')
})

describe('getFavoriteViews', () => {
  it('should return empty array if user has no token', async () => {
    const user = {} as User
    const result = getFavoriteViews(user)
    await expect(result).resolves.toEqual([])
  })

  it('should return favorite views', async () => {
    const user = {
      token: '123'
    } as User
    const result = getFavoriteViews(user)
    await expect(result).resolves.toEqual([{ type: 'customView' }])
    await expect(result).resolves.toHaveLength(1)
    expect(decrypt).toHaveBeenCalledWith('123')
    expect(LinearClient).toHaveBeenCalledWith({ accessToken: 'decrypted-token' })
  })
})
