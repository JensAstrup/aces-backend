import { Issue, User, Vote } from '@prisma/client'

import createIssue from '@aces/services/issues/create-issue'
import getIssue from '@aces/services/issues/get-issue'
import createVote from '@aces/services/rounds/create-vote'
import setVote from '@aces/services/rounds/set-vote'


jest.mock('@aces/services/issues/get-issue')
jest.mock('@aces/services/issues/create-issue')
jest.mock('@aces/services/rounds/create-vote')

const mockGetIssue = getIssue as jest.MockedFunction<typeof getIssue>
const mockCreateIssue = createIssue as jest.MockedFunction<typeof createIssue>
const mockCreateVote = createVote as jest.MockedFunction<typeof createVote>

describe('setVote', () => {
  const mockRoundId = 'round-1'
  const mockLinearId = 'linear-1'
  const mockVoteValue = 5
  const mockUser: User = { id: 'user-1' } as User
  const mockIssue: Issue = { id: 'issue-1', roundId: mockRoundId, linearId: mockLinearId } as Issue
  const mockVote: Vote = { id: 'vote-1', issueId: mockIssue.id, userId: mockUser.id, value: mockVoteValue } as Vote

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should set a vote for an existing issue', async () => {
    mockGetIssue.mockResolvedValue(mockIssue)
    mockCreateVote.mockResolvedValue(mockVote)

    const result = await setVote(mockRoundId, mockLinearId, mockVoteValue, mockUser)

    expect(mockGetIssue).toHaveBeenCalledWith({ roundId: mockRoundId, linearId: mockLinearId })
    expect(mockCreateIssue).not.toHaveBeenCalled()
    expect(mockCreateVote).toHaveBeenCalledWith(mockIssue, mockUser, mockVoteValue)
    expect(result).toEqual(mockVote)
  })

  it('should create a new issue and set a vote when the issue does not exist', async () => {
    mockGetIssue.mockResolvedValue(null)
    mockCreateIssue.mockResolvedValue(mockIssue)
    mockCreateVote.mockResolvedValue(mockVote)

    const result = await setVote(mockRoundId, mockLinearId, mockVoteValue, mockUser)

    expect(mockGetIssue).toHaveBeenCalledWith({ roundId: mockRoundId, linearId: mockLinearId })
    expect(mockCreateIssue).toHaveBeenCalledWith(mockRoundId, mockLinearId)
    expect(mockCreateVote).toHaveBeenCalledWith(mockIssue, mockUser, mockVoteValue)
    expect(result).toEqual(mockVote)
  })

  it('should handle errors from getIssue', async () => {
    const mockError = new Error('Failed to get issue')
    mockGetIssue.mockRejectedValue(mockError)

    await expect(setVote(mockRoundId, mockLinearId, mockVoteValue, mockUser)).rejects.toThrow('Failed to get issue')
    expect(mockCreateIssue).not.toHaveBeenCalled()
    expect(mockCreateVote).not.toHaveBeenCalled()
  })

  it('should handle errors from createIssue', async () => {
    mockGetIssue.mockResolvedValue(null)
    const mockError = new Error('Failed to create issue')
    mockCreateIssue.mockRejectedValue(mockError)

    await expect(setVote(mockRoundId, mockLinearId, mockVoteValue, mockUser)).rejects.toThrow('Failed to create issue')
    expect(mockCreateVote).not.toHaveBeenCalled()
  })

  it('should handle errors from createVote', async () => {
    mockGetIssue.mockResolvedValue(mockIssue)
    const mockError = new Error('Failed to create vote')
    mockCreateVote.mockRejectedValue(mockError)

    await expect(setVote(mockRoundId, mockLinearId, mockVoteValue, mockUser)).rejects.toThrow('Failed to create vote')
  })
})
