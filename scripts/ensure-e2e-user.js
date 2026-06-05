/**
 * Đảm bảo tài khoản E2E tồn tại và đã kích hoạt trên MongoDB mà API dev đang dùng.
 * Chạy trước Selenium (Trello-web npm run test:e2e).
 *
 * Env: E2E_TEST_EMAIL, E2E_TEST_PASSWORD (và .env API cho MONGODB_URI).
 */
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { CONNECT_DB, CLOSE_DB } from '../src/config/mongodb.js'
import { userModel } from '../src/models/userModel.js'

const main = async () => {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD

  if (!email || !password) {
    console.log('[ensure-e2e-user] E2E_TEST_EMAIL/PASSWORD not set — skip')
    return
  }

  if (!process.env.MONGODB_URI) {
    console.warn('[ensure-e2e-user] MONGODB_URI missing — skip (API .env not loaded?)')
    return
  }

  await CONNECT_DB()

  const nameFromEmail = email.split('@')[0]
  let user = await userModel.findOneByEmail(email)

  if (!user) {
    await userModel.createNew({
      email,
      password: bcrypt.hashSync(password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      isActive: true
    })
    console.log(`[ensure-e2e-user] Created and activated: ${email}`)
  } else {
    const updates = {}
    if (!user.isActive) {
      updates.isActive = true
    }
    if (!bcrypt.compareSync(password, user.password)) {
      updates.password = bcrypt.hashSync(password, 8)
    }
    if (Object.keys(updates).length > 0) {
      await userModel.update(user._id, updates)
      console.log(`[ensure-e2e-user] Updated user for E2E: ${email}`)
    } else {
      console.log(`[ensure-e2e-user] User ready: ${email}`)
    }
  }

  await CLOSE_DB()
}

main().catch((err) => {
  console.error('[ensure-e2e-user] Failed:', err.message)
  process.exit(1)
})
