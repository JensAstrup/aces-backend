import getViewIssues from '@aces/services/views/get-view-issues'
import decrypt from '@aces/util/encryption/decrypt'


jest.mock('@aces/util/encryption/decrypt')
const mockDecrypt = decrypt as jest.Mock


jest.mock('@linear/sdk', () => {
  return {
    LinearClient: jest.fn().mockReturnValue({
      client: {
        rawRequest: jest.fn().mockResolvedValue({
          data: {
            customView: {
              issues: {
                nodes: [
                  {
                    id: '123',
                    title: 'title',
                    description: 'description',
                    state: {
                      name: 'name',
                      type: 'type'
                    },
                    comments: {
                      nodes: [
                        {
                          id: '123',
                          createdAt: 'createdAt',
                          body: 'body',
                          user: {
                            id: '123',
                            name: 'name',
                            avatarUrl: 'avatarUrl',
                          },
                          botActor: {
                            id: '123'
                          }
                        }
                      ]
                    },
                    url: 'url'
                  }
                ]
              }
            }
          }
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
        },
        comments: {
          nodes: [
            {
              id: '123',
              body: 'body',
              createdAt: 'createdAt',
              user: {
                id: '123',
                name: 'name',
                avatarUrl: 'avatarUrl'
              },
              botActor: {
                id: '123'
              }
            }
          ]
        },
        url: 'url'
      }
    ])
  })
})
