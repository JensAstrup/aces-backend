import { Issue, LinearClient } from '@linear/sdk'

import decrypt from '@aces/util/encryption/decrypt'


async function getViewIssues(viewId: string, accessToken: string): Promise<Issue[]> {
  const decryptedToken = decrypt(accessToken)
  const client = new LinearClient({ accessToken: decryptedToken })
  const graphQlClient = client.client
  const query = `query issues($viewId: String!, $filter: IssueFilter) {
    customView(id: $viewId) {
      id
      name
      issues(filter: $filter) {
        nodes {
          id
          title
          description
          state {
            name
            type
            }
          }
        }
      }
    }`
  const filter = {
    estimate: {
      null: true
    }
  }
  const issueConnection = await graphQlClient.rawRequest(query, { viewId, filter })
  return issueConnection.data as Issue[]
}

export default getViewIssues
