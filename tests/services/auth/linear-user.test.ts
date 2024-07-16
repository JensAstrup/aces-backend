import getLinearUser from '@aces/services/auth/linear-user'


jest.mock('@linear/sdk', () => {
  return {
    LinearClient: jest.fn().mockImplementation(() => {
      return {
        viewer: {
          id: '123456'
        }
      }
    })
  }
})
describe('linearUser', () => {
  it('should return a user', async () => {
    const linearUser = await getLinearUser('token-123456')
    expect(linearUser).toEqual({ id: '123456' })
  })
})
