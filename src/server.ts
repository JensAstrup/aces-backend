import cors from 'cors'
import 'express-async-errors'
import express, { NextFunction, Request, Response } from 'express'
import session from 'express-session'
import helmet from 'helmet'
import morgan from 'morgan'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import { NodeEnvs } from '@aces/common/misc'
import RouteError from '@aces/errors/route-error'
import appRouter from '@aces/routes/index'
import PrismaSessionStore from '@aces/services/sessions/store'


// **** Variables **** //
const app = express()


// **** Setup **** //
// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Auth middleware
app.use(session({
  secret: process.env.COOKIE_SECRET!,
  resave: false,
  saveUninitialized: true,
  store: new PrismaSessionStore(),
  cookie: { secure: process.env.NODE_ENV === 'production' }
}))

// Show routes called in console during development
if (process.env.NODE_EVN === NodeEnvs.Dev.valueOf()) {
  app.use(morgan('dev'))
}

// Security
if (process.env.NODE_ENV === NodeEnvs.Production.valueOf()) {
  app.use(helmet())
}

app.use('/', appRouter)


// Add error handler
app.use((
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (process.env.NODE_ENV !== NodeEnvs.Test.valueOf()) {
    console.error(err, true)
  }
  let status = HttpStatusCodes.BAD_REQUEST
  if (err instanceof RouteError) {
    status = err.status
  }
  return res.status(status).json({ error: err.message })
})

export default app
