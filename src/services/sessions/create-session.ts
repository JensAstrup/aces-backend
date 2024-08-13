import { PrismaClient, Round, Session, User } from '@prisma/client'


const prisma = new PrismaClient()

async function createSession(user: User, round: Round): Promise<Session> {
  const session = await prisma.session.create({
    data: {
      user: { connect: { id: user.id } },
      round: {
        connect: { id: round.id }
      }
    }
  })
  return session
}

export default createSession
