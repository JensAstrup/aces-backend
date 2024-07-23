import { Issue, LinearClient } from '@linear/sdk'

import getIssue from '@aces/linear/get-issue'
import { issueFields } from '@aces/linear/issue-fields'


jest.mock('@aces/linear/issue-fields', () => ({
  issueFields: 'id title description'
}))

jest.mock('@linear/sdk', () => {
  return {
    LinearClient: jest.fn(() => {
      return {
        client: {
          request: jest.fn()
        }
      }
    })
  }
})
const mockLinearClient = LinearClient as jest.Mock

describe('getIssue', () => {
  const mockAccessToken = 'mock-access-token'
  const mockIssueId = 'mock-issue-id'
  const mockIssue: Issue = { id: mockIssueId, title: 'Mock Issue', description: 'This is a mock issue' } as Issue

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return an issue when it exists', async () => {
    const mockRequest = jest.fn().mockResolvedValue({ issue: mockIssue })
    mockLinearClient.mockImplementation(() => ({
      client: { request: mockRequest }
    }))

    const result = await getIssue(mockIssueId, mockAccessToken)

    expect(result).toEqual(mockIssue)
    expect(mockLinearClient).toHaveBeenCalledWith({ accessToken: mockAccessToken })
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining('query issue($issueId: String!)'),
      { issueId: mockIssueId }
    )
  })

  it('should return null when the issue does not exist', async () => {
    const mockRequest = jest.fn().mockResolvedValue({ issue: null })
    jest.mocked(mockLinearClient).mockImplementation(() => ({
      client: { request: mockRequest }
    }))

    const result = await getIssue(mockIssueId, mockAccessToken)

    expect(result).toBeNull()
  })

  it('should use the correct issue fields in the query', async () => {
    const mockRequest = jest.fn().mockResolvedValue({ issue: mockIssue })
    jest.mocked(mockLinearClient).mockImplementation(() => ({
      client: { request: mockRequest }
    }))

    await getIssue(mockIssueId, mockAccessToken)

    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining(issueFields),
      expect.any(Object)
    )
  })

  it('should throw an error when the API request fails', async () => {
    const mockError = new Error('API request failed')
    const mockRequest = jest.fn().mockRejectedValue(mockError)
    jest.mocked(mockLinearClient).mockImplementation(() => ({
      client: { request: mockRequest }
    }))

    await expect(getIssue(mockIssueId, mockAccessToken)).rejects.toThrow('API request failed')
  })
})
