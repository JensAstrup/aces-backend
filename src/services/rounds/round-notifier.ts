import { Issue, PrismaClient, Round } from '@prisma/client'

import { VoteUpdatedMessage } from '@aces/interfaces/socket-message'
import sendMessageToRound from '@aces/socket/send-message-to-round'


class RoundNotifier {
  public round: Round
  private db: PrismaClient = new PrismaClient()

  public constructor(round: Round) {
    this.round = round
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
    const message: VoteUpdatedMessage = { event: 'voteUpdated', type: 'vote', payload: { issueId: issue.id, votes } }
    sendMessageToRound(this.round.id, message)
  }
}

export default RoundNotifier
