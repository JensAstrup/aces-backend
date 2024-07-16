import { LinearClient, User } from '@linear/sdk'


async function getLinearUser(accessToken: string): Promise<User> {
  const linearClient = new LinearClient({ accessToken })
  return await linearClient.viewer
}

export default getLinearUser
