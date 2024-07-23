import cors from 'cors'
import 'express-async-errors'
import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import { NodeEnvs } from '@aces/common/misc'
import RouteError from '@aces/errors/route-error'
import setUser from '@aces/middleware/set-user'
import BaseRouter from '@aces/routes/auth'
import roundsRouter from '@aces/routes/rounds'
import viewRouter from '@aces/routes/views'


// **** Variables **** //
const app = express()


// **** Setup **** //
// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(setUser)

// Show routes called in console during development
if (process.env.NODE_EVN === NodeEnvs.Dev.valueOf()) {
  app.use(morgan('dev'))
}

// Security
if (process.env.NODE_ENV === NodeEnvs.Production.valueOf()) {
  app.use(helmet())
}

app.use('/views', viewRouter)
app.use('/rounds', roundsRouter)
app.use('/', BaseRouter)


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
