/**
 * Setup express server.
 */

// eslint-disable-next-line import/order
import morgan from 'morgan'
import 'express-async-errors'


import EnvVars from '@aces/common/EnvVars'
import HttpStatusCodes from '@aces/common/HttpStatusCodes'
import { NodeEnvs } from '@aces/common/misc'
import Paths from '@aces/common/Paths'
import RouteError from '@aces/common/RouteError'
import BaseRouter from '@aces/routes'

// eslint-disable-next-line import/order
import express, { NextFunction, Request, Response } from 'express'
// eslint-disable-next-line import/order
import helmet from 'helmet'
// eslint-disable-next-line import/order
import logger from 'jet-logger'


// **** Variables **** //

const app = express()


// **** Setup **** //

// Basic middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.Dev.valueOf()) {
  app.use(morgan('dev'))
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.Production.valueOf()) {
  app.use(helmet())
}

// Add APIs, must be after middleware
app.use(Paths.Base, BaseRouter)

// Add error handler
app.use((
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (EnvVars.NodeEnv !== NodeEnvs.Test.valueOf()) {
    logger.err(err, true)
  }
  let status = HttpStatusCodes.BAD_REQUEST
  if (err instanceof RouteError) {
    status = err.status
  }
  return res.status(status).json({ error: err.message })
})

export default app
