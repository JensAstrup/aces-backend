import { Issue } from '@prisma/client'


type SocketMessageType = 'vote' | 'issue' | 'round' | 'user'
type SocketMessageEvent = 'voteUpdated' | 'roundIssueUpdated' | 'response' | 'error'

interface SocketMessage {
    event: SocketMessageEvent
    type?: SocketMessageType
    payload: object
}

interface VoteUpdatedPayload {
    issueId: string
    votes: number[]
    expectedVotes: number
}

interface VoteUpdatedMessage extends SocketMessage {
    event: 'voteUpdated'
    payload: VoteUpdatedPayload
}

interface RoundIssueChangedMessage extends SocketMessage {
    event: 'roundIssueUpdated'
    payload: Issue
}

export default SocketMessage
export type { RoundIssueChangedMessage, SocketMessage, SocketMessageEvent, SocketMessageType, VoteUpdatedMessage, VoteUpdatedPayload }
