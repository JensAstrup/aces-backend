import './pre-start'
import http from 'http'

import * as Sentry from '@sentry/node'

import { setupWebSocket } from '@aces/socket/setup-websocket'

import app from './server' // Must be the first import


// **** Run **** //

const PORT = process.env.PORT
const SERVER_START_MSG = ('Express server started on port: ' + PORT)

const server = http.createServer(app)

Sentry.setupExpressErrorHandler(app)


server.listen(process.env.PORT, () => {
  setupWebSocket(server)
  console.info(SERVER_START_MSG)
})
