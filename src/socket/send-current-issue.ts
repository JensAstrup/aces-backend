import { PrismaClient } from '@prisma/client'
import { WebSocket } from 'ws'

import { WebSocketCloseCode } from '@aces/common/WebSocketCodes'
import getIssue from '@aces/linear/get-issue'
import decrypt from '@aces/util/encryption/decrypt'


const prismaClient = new PrismaClient()

async function sendCurrentIssue(roundId: string, ws: WebSocket): Promise<void> {
  try {
    const round = await prismaClient.round.findUnique({
      where: { id: roundId },
      include: { creator: true, currentIssue: true }
    })

    if (!round) {
      console.error(`Round not found: ${roundId}`)
      ws.close(WebSocketCloseCode.POLICY_VIOLATION, 'Round not found')
      return
    }

    if (round.currentIssue) {
      console.log(`Sending current issue for round ${roundId}`)
      const issueId: string | null = round.currentIssue.linearId
      if (!issueId) {
        console.error(`No issue ID found for current issue in round ${roundId}`)
        return
      }
      const issue = await getIssue(issueId, decrypt(round.creator.token))
      if (issue) {
        ws.send(JSON.stringify(issue))
      }
    }
  }
  catch (error) {
    console.error(`Error sending current issue for round ${roundId}:`, error)
  }
}

export default sendCurrentIssue
