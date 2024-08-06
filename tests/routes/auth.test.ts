import anonymousRegistration from '@aces/handlers/auth/anonymous-registration'
import authorize from '@aces/handlers/auth/authorize'
import disconnect from '@aces/handlers/auth/disconnect'


describe('round routes', () => {
  it('should create a round route', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const authRouter = require('@aces/routes/auth').default
    // eslint-disable-next-line @typescript-eslint/no-var-requires

    expect(authRouter).toBeInstanceOf(Function)
    expect(authRouter.stack).toHaveLength(3)
    expect(authRouter.stack[0].route.path).toEqual('/anonymous')
    expect(authRouter.stack[0].route.methods.post).toBeTruthy()
    expect(authRouter.stack[0].route.stack[0].handle).toEqual(anonymousRegistration)
    expect(authRouter.stack[1].route.path).toEqual('/disconnect')
    expect(authRouter.stack[1].route.methods.post).toBeTruthy()
    expect(authRouter.stack[1].route.stack[0].handle).toEqual(disconnect)
    expect(authRouter.stack[2].route.path).toEqual('/')
    expect(authRouter.stack[2].route.methods.post).toBeTruthy()
    expect(authRouter.stack[2].route.stack[0].handle).toEqual(authorize)
  })
})
