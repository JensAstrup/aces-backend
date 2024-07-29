import createRoundHandler from '@aces/handlers/rounds/create'
import setIssueHandler from '@aces/handlers/rounds/set-issue'
import setVoteHandler from '@aces/handlers/rounds/set-vote'


describe('round routes', () => {
  it('should create a round route', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const roundsRouter = require('@aces/routes/rounds').default
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@aces/handlers/rounds/create').default

    expect(roundsRouter).toBeInstanceOf(Function)
    expect(roundsRouter.stack).toHaveLength(3)
    expect(roundsRouter.stack[0].route.path).toEqual('/:roundId/issue')
    expect(roundsRouter.stack[0].route.methods.post).toBeTruthy()
    expect(roundsRouter.stack[0].route.stack[0].handle).toEqual(setIssueHandler)
    expect(roundsRouter.stack[1].route.path).toEqual('/:roundId/vote')
    expect(roundsRouter.stack[1].route.methods.post).toBeTruthy()
    expect(roundsRouter.stack[1].route.stack[0].handle).toEqual(setVoteHandler)
    expect(roundsRouter.stack[2].route.path).toEqual('/')
    expect(roundsRouter.stack[2].route.methods.post).toBeTruthy()
    expect(roundsRouter.stack[2].route.stack[0].handle).toEqual(createRoundHandler)
  })
})
