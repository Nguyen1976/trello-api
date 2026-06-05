/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import { APIs_v1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware.js'
import cookieParser from 'cookie-parser'

/**
 * Factory Express app dùng cho supertest (không listen, không Socket.IO).
 */
export const createApp = () => {
  const app = express()

  // Ẩn header X-Powered-By để giảm lộ thông tin stack (OWASP ZAP passive finding).
  app.disable('x-powered-by')

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cookieParser())
  app.use(cors(corsOptions))
  app.use(express.json())
  app.use('/v1', APIs_v1)
  app.use(errorHandlingMiddleware)

  return app
}
