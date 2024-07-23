import { CustomViewQuery, Issue, LinearClient, LinearRawResponse } from '@linear/sdk'

import { issueFields } from '@aces/linear/issue-fields'
import decrypt from '@aces/util/encryption/decrypt'


interface IssueResults {
  issues: Issue[]
  nextPage: string | null
}


async function getViewIssues(viewId: string, accessToken: string, nextPage?: string | null): Promise<IssueResults> {
  const decryptedToken = decrypt(accessToken)
  const client = new LinearClient({ accessToken: decryptedToken })
  const graphQlClient = client.client

  const query = `query issues($viewId: String!, $filter: IssueFilter, $nextPage: String) {
    customView(id: $viewId) {
      id
      name
      issues(filter: $filter, first: 25, after: $nextPage) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
            ${issueFields}
          }
        }
      }
    }`
  const filter = {
    estimate: {
      null: true
    }
  }
  const issueConnection: LinearRawResponse<CustomViewQuery> = await graphQlClient.rawRequest(query, { viewId, filter, nextPage })
  // @ts-expect-error customView does exist
  const issues = issueConnection.data?.customView.issues.nodes
  // @ts-expect-error customView does exist
  const hasNextPage = issueConnection.data?.customView.issues.pageInfo.hasNextPage
  console.log(hasNextPage)
  // @ts-expect-error customView does exist
  const endCursor = hasNextPage ? issueConnection.data?.customView.issues.pageInfo.endCursor : null
  return { issues, nextPage: endCursor }
}

export default getViewIssues
