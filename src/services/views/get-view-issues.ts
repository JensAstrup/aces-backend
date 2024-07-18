import { CustomViewQuery, Issue, LinearClient, LinearRawResponse } from '@linear/sdk'

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
            url
          }
        }
      }
    }`
  const filter = {
    estimate: {
      null: true
    }
  }
  const issueConnection: LinearRawResponse<CustomViewQuery> = await graphQlClient.rawRequest(query, { viewId, filter })
  // @ts-expect-error customView does exist
  return issueConnection.data?.customView.issues?.nodes
}

export default getViewIssues
