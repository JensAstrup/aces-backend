import { PrismaClient } from '@prisma/client'
import { WebSocket } from 'ws'

import { WebSocketCloseCode } from '@aces/common/WebSocketCodes'
import getLinearIssue from '@aces/linear/get-linear-issue'
import sendMessageToRound from '@aces/socket/send-message-to-round'
import decrypt from '@aces/util/encryption/decrypt'


const prismaClient = new PrismaClient()

/**
 * Send the current issue for a round to a WebSocket client, this is used when the connection is first established
 * @param roundId
 * @param socket
 */
async function sendCurrentIssue(roundId: string, socket: WebSocket): Promise<void> {
  try {
    const round = await prismaClient.round.findUnique({
      where: { id: roundId },
      include: { creator: true, currentIssue: true }
    })

    if (!round) {
      console.error(`Round not found: ${roundId}`)
      socket.close(WebSocketCloseCode.POLICY_VIOLATION, 'Round not found')
      return
    }

    if (round.currentIssue) {
      console.log(`Sending current issue for round ${roundId}`)
      const issueId: string | null = round.currentIssue.linearId
      if (!issueId) {
        console.error(`No issue ID found for current issue in round ${roundId}`)
        return
      }
      const issue = await getLinearIssue(issueId, decrypt(round.creator.token))
      if (issue) {
        sendMessageToRound(roundId, { type: 'issue', payload: issue, event: 'response' })
      }
    }
  }
  catch (error) {
    console.error(`Error sending current issue for round ${roundId}:`, error)
  }
}

export default sendCurrentIssue
