/*eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb.js'
import exitHook from 'async-exit-hook'
import { env } from '~/config/environment.js'
import { APIs_v1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware.js'

const START_SERVER = async () => {
  const app = express()

  app.use(cors(corsOptions))

  app.use(express.json())

  //Use APIs v1
  app.use('/v1', APIs_v1)

  //Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  //Môi trường production (cụ thể đang support cho render)
  if (env.BUILD_MODE === 'production') {
    //Vì thằng env nó tự có PORT và sẽ tự chỉ định PORT cho mình lên sẽ như này....
    app.listen(process.env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(
        `3. Production: ${env.AUTHOR} BE is running at PORT:${process.env.PORT}/`
      )
    })
  } else {
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
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
