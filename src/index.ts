import './pre-start' // Must be the first import
import logger from 'jet-logger'

import server from './server'


// **** Run **** //

const PORT = process.env.PORT
const SERVER_START_MSG = ('Express server started on port: ' + PORT)

server.listen(process.env.PORT, () => {
  logger.info(SERVER_START_MSG)
})
