import { csrfSync } from 'csrf-sync'
import { Express, NextFunction, Request, Response, Router } from 'express'
import session from 'express-session'


jest.mock('express', () => {
  const mockRouter = jest.fn(() => ({
    ...jest.requireActual('express')(),
    post: jest.fn(),
    get: jest.fn(),
    use: jest.fn(),
  }))

  const mockExpress: jest.Mocked<Express> = {
    use: jest.fn(),
    _router: { stack: [] },
  } as unknown as jest.Mocked<Express>

  const mockExpressFunction = jest.fn(() => mockExpress) as unknown as {
    Router: typeof Router
    urlencoded: jest.Mock
    json: jest.Mock
  } & jest.MockedFunction<typeof import('express')>
  mockExpressFunction.Router = mockRouter
  mockExpressFunction.urlencoded = jest.fn().mockReturnValue(jest.fn())
  mockExpressFunction.json = jest.fn().mockReturnValue(jest.fn())

  return mockExpressFunction
})
jest.mock('express-session')
jest.mock('csrf-sync', () => ({
  csrfSync: jest.fn(() => ({
    csrfSynchronisedProtection: jest.fn((req: Request, res: Response, next: NextFunction) => {
      next()
    }),
    generateToken: jest.fn()
  }))
}))
jest.mock('@aces/routes/index')
jest.mock('@aces/services/sessions/store')
jest.mock('@aces/util/generate-csrf-token', () => ({
  generateCsrfToken: jest.fn()
}))

describe('Server', () => {
  let app: jest.Mocked<Express>
  let mockExpress: {
    Router: jest.MockedFunction<typeof Router>
  } & jest.MockedFunction<typeof import('express')>
  let mockSession: jest.MockedFunction<typeof session>
  let mockCsrfSync: jest.MockedFunction<typeof csrfSync>

  beforeEach(async () => {
    jest.resetModules()
    process.env.FRONTEND_URL = 'http://localhost:3000'
    process.env.COOKIE_SECRET = 'test-secret'
    process.env.NODE_ENV = 'test'

    mockExpress = require('express')
    mockSession = require('express-session')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mockCsrfSync = require('csrf-sync').csrfSync

    mockSession.mockReturnValue((req: Request, res: Response, next: NextFunction) => {
      // @ts-expect-error We don't need a full session object
      req.session = {}
      next()
    })

    jest.spyOn(console, 'error').mockImplementation(() => {})

    app = mockExpress() as jest.Mocked<Express>

    // Import and execute the server code
    await import('@aces/server')
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should set up basic middleware', () => {
    expect(mockExpress.json).toHaveBeenCalled()
    expect(mockExpress.urlencoded).toHaveBeenCalledWith({ extended: true })
    expect(app.use).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should set up CORS', () => {
    expect(app.use).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should set up CSRF protection', () => {
    expect(mockCsrfSync).toHaveBeenCalled()
    expect(app.use).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should set up error handling middleware', () => {
    const errorHandler = (app.use as jest.Mock).mock.calls.find(
      call => call[0] && call[0].length === 4
    )
    expect(errorHandler).toBeTruthy()
  })
})
