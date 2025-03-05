/*eslint-disable no-console */
import express from 'express'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb.js'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment.js'
import { APIs_v1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware.js'

const START_SERVER = async () => {
  const app = express()

  app.use(express.json())

  //Use APIs v1
  app.use('/v1', APIs_v1)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(
      `3. ${env.AUTHOR} is running at ${env.APP_HOST}:${env.APP_PORT}/`
    )
  })

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
