import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
import { userRoute } from './userRoute'
import { invitationRoute } from './invitationRoute'

const Router = express.Router()

/**Check APIs v1 status */
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs v1 are ready to use.' })
})
Router.get('/stress', (req, res) => {
  const startTime = Date.now()
  
  const iterations = 10000000000

  let result = 0

  // Vòng lặp nặng - sẽ chặn Event Loop của Node.js
  for (let i = 0; i < iterations; i++) {
    result += i * Math.sin(i)
    // Sau 1 giây, giả định là đủ tải, thoát ra
    if (Date.now() - startTime > 1000) {
      break
    }
  }

  const endTime = Date.now()
  const duration = endTime - startTime

  res.status(200).json({
    message: 'CPU Stress Test Completed',
    duration_ms: duration,
    iterations: iterations,
    note: 'API was blocked for 1 second to maximize CPU usage.'
  })
})

/*Board API */
Router.use('/boards', boardRoute)
Router.use('/columns', columnRoute)
Router.use('/cards', cardRoute)
Router.use('/users', userRoute)
Router.use('/invitations', invitationRoute)

export const APIs_v1 = Router
