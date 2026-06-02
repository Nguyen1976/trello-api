/*eslint-disable no-console */
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb.js'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment.js'
import { corsOptions } from '~/config/cors'
import { createApp } from '~/app.js'
import socketIo from 'socket.io'
import http from 'http'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket'

const START_SERVER = async () => {
  const app = createApp()

  const server = http.createServer(app)
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  })

  if (env.BUILD_MODE === 'production') {
    server.listen(process.env.PORT, () => {
      console.log(
        `3. Production: ${env.AUTHOR} BE is running at PORT:${process.env.PORT}/`
      )
    })
  } else {
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(
        `3. Local DEV: ${env.AUTHOR} is running at ${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`
      )
    })
  }

  exitHook(() => {
    CLOSE_DB()
  })
}

if (process.env.NODE_ENV !== 'test') {
  ;(async () => {
    try {
      console.log('1. Connecting to MongoDB...')
      await CONNECT_DB()
      console.log('2. Connected to MongoDB successfully!')
      START_SERVER()
    } catch (error) {
      console.error('Error connecting to MongoDB:', error)
      process.exit(0)
    }
  })()
}
