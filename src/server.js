/*eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb.js'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment.js'
import { APIs_v1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware.js'
import cookieParser from 'cookie-parser'
//xử lý socket realtime với socket.io
//https://socket.io/get-started/chat#integrating-socketio
import socketIo from 'socket.io'
import http from 'http'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket'

const START_SERVER = async () => {
  const app = express()

  //Fix bug cache from disk của expressJs
  //https://stackoverflow.com/a/53240717/8324172
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  //Cấu hình cookie parser
  app.use(cookieParser())

  app.use(cors(corsOptions))

  app.use(express.json())

  //Use APIs v1
  app.use('/v1', APIs_v1)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  //Tạo một cái server mới bọc thằng app của express để làm realtime với socket.io
  const server = http.createServer(app)
  //Khởi tạo biến io với server và cors
  const io = socketIo(server, { cors: corsOptions })
  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  })

  //Môi trường production (cụ thể đang support cho render)
  if (env.BUILD_MODE === 'production') {
    //Vì thằng env nó tự có PORT và sẽ tự chỉ định PORT cho mình lên sẽ như này....
    server.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(
        `3. Production: ${env.AUTHOR} BE is running at PORT:${process.env.PORT}/`
      )
    })
  } else {
    server.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      // eslint-disable-next-line no-console
      console.log(
        `3. Local DEV: ${env.AUTHOR} is running at ${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/`
      )
    })
  }

  exitHook(() => {
    CLOSE_DB()
  })
}
//IIFE Hàm bất đồng bộ tự gọi ngay lập tức (tức là tự gọi ngay khi chương trình chạy)
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

// CONNECT_DB()
//   .then(() => {
//     console.log('Connected to MongoDB successfully!')
//   })
//   .then(() => {
//     START_SERVER()
//   })
//   .catch((error) => {
//     console.error('Error connecting to MongoDB:', error)
//     process.exit(0)
//   })
