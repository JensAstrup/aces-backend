import { Issue, LinearClient } from '@linear/sdk'

import { issueFields } from '@aces/linear/issue-fields'


interface IssueResponse {
    issue: Issue | null
}

async function getIssue(issueId: string, accessToken: string): Promise<Issue | null> {
  const client = new LinearClient({ accessToken })
  const graphQlClient = client.client
  const query = `query issue($issueId: String!) {
        issue(id: $issueId) {
        ${issueFields}
        }
    }`
  const variables = { issueId }
  const response: IssueResponse = await graphQlClient.request(query, variables)
  return response.issue ? response.issue : null
}

export default getIssue
