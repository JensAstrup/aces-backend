import getViewIssues from '@aces/services/views/get-view-issues'
import decrypt from '@aces/util/encryption/decrypt'


jest.mock('@aces/util/encryption/decrypt')
const mockDecrypt = decrypt as jest.Mock


jest.mock('@linear/sdk', () => {
  return {
    LinearClient: jest.fn().mockReturnValue({
      client: {
        rawRequest: jest.fn().mockResolvedValue({
          data: [
            {
              id: '123',
              title: 'title',
              description: 'description',
              state: {
                name: 'name',
                type: 'type'
              }
            }
          ]
        })
      }
    })
  }
})

describe('getViewIssues', () => {
  it('should query issues', async () => {
    const viewId = '123'
    const accessToken = '456'
    const decryptedToken = '789'
    mockDecrypt.mockReturnValue(decryptedToken)

    const result = getViewIssues(viewId, accessToken)
    await expect(result).resolves.toEqual([
      {
        id: '123',
        title: 'title',
        description: 'description',
        state: {
          name: 'name',
          type: 'type'
        }
      }
    ])
  })
})
