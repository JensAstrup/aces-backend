import { PrismaClient, Round, RoundGuest } from '@prisma/client'


const prisma = new PrismaClient()


type GetGuestsParams = { round?: string } | { round?: Round }

async function getGuests({ round }: GetGuestsParams): Promise<RoundGuest[]> {
  if (typeof round !== 'string') {
    round = round!.id
  }
  return prisma.roundGuest.findMany({
    where: {
      roundId: round
    }
  })
}

export default getGuests
