import { Issue, PrismaClient, Round, RoundGuest } from '@prisma/client'

import { VoteUpdatedMessage } from '@aces/interfaces/socket-message'
import sendMessageToRound from '@aces/socket/send-message-to-round'


type RoundWithRelations = {
  guests: RoundGuest[]
  issues: Issue[]
} & Round


class RoundNotifier {
  public round: RoundWithRelations
  private db: PrismaClient = new PrismaClient()

  public constructor(round: RoundWithRelations) {
    this.round = round
  }

  public static async get(roundId: string): Promise<RoundWithRelations | null> {
    const db = new PrismaClient()
    const round = await db.round.findUnique({ where: { id: roundId }, include: { guests: true, issues: true } })
    return round
  }


  public async voteSet(issue: Issue): Promise<void> {
    const voteRecords = await this.db.vote.findMany({
      where: {
        issue: {
          id: issue.id
        }
      },
    })
    const votes = voteRecords.map(vote => vote.vote)
    const expectedVoted = this.round.guests.length + 1 // +1 for the host
    const message: VoteUpdatedMessage = { event: 'voteUpdated', type: 'vote', payload: { issueId: issue.id, votes, expectedVotes: expectedVoted } }
    sendMessageToRound(this.round.id, message)
  }
}

export default RoundNotifier
