import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'
import { userRoute } from './userRoute'
import { invitationRoute } from './invitationRoute'
import { exec } from 'child_process'
import fs from 'fs'
const PID_FILE = '/tmp/stress_pid.txt'

const Router = express.Router()

/**Check APIs v1 status */
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs v1 are ready to use.' })
})
Router.post('/start-stress-test', (req, res) => {
  // Lệnh Bash cực nặng: Chạy một vòng lặp vô hạn ở chế độ nền.
  // Lệnh này sẽ chiếm 100% của một core CPU cho đến khi bị kill.
  const stressCommand = '(while true; do true; done) & echo $! > ' + PID_FILE

  exec(stressCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error starting stress: ${stderr}`)
      return res.status(500).json({
        status: 'Failed',
        message: 'Could not start stress process on OS.',
        error: error.message
      })
    }

    // PID được echo và lưu vào file sau khi lệnh chạy nền được kích hoạt
    const pid = fs.readFileSync(PID_FILE, 'utf8').trim()
    res.status(200).json({
      status: 'Success',
      message: `Nuclear Stress Test STARTED. PID: ${pid}. CPU will now be high.`,
      pid: pid
    })
  })
})

Router.post('/stop-stress-test', (req, res) => {
  if (!fs.existsSync(PID_FILE)) {
    return res
      .status(200)
      .json({ status: 'Info', message: 'No active stress process found.' })
  }

  try {
    const pid = fs.readFileSync(PID_FILE, 'utf8').trim()

    // Lệnh kill tiến trình
    exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error killing PID ${pid}: ${stderr}`)
        // Có thể tiến trình đã tự kết thúc
      }

      // Dọn dẹp file PID
      fs.unlinkSync(PID_FILE)
      res.status(200).json({
        status: 'Stopped',
        message: `Stress process (PID: ${pid}) was successfully terminated.`,
        pid: pid
      })
    })
  } catch (e) {
    // Xử lý lỗi đọc/ghi file
    res.status(500).json({
      status: 'Error',
      message: 'Failed to read PID file or kill process.'
    })
  }
})

/*Board API */
Router.use('/boards', boardRoute)
Router.use('/columns', columnRoute)
Router.use('/cards', cardRoute)
Router.use('/users', userRoute)
Router.use('/invitations', invitationRoute)

export const APIs_v1 = Router
