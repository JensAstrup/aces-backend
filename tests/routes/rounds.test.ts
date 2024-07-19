import create from '@aces/handlers/rounds/create'


describe('round routes', () => {
  it('should create a round route', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const roundsRouter = require('@aces/routes/rounds').default
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@aces/handlers/rounds/create').default

    expect(roundsRouter).toBeInstanceOf(Function)
    expect(roundsRouter.stack).toHaveLength(1)
    expect(roundsRouter.stack[0].route.path).toEqual('/')
    expect(roundsRouter.stack[0].route.methods.post).toBeTruthy()
    expect(roundsRouter.stack[0].route.stack[0].handle).toEqual(create)
  })
})
