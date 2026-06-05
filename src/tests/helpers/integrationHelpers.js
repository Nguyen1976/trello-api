import request from 'supertest'
import crypto from 'crypto'
import { createApp } from '~/app'
import { userModel } from '~/models/userModel'
import { BOARD_TYPES } from '~/utils/constants'
import { env } from '~/config/environment'

export const VALID_PASSWORD = 'Password1'
export const VALID_EMAIL = 'testuser@example.com'

// 24-hex ObjectId hợp lệ về format nhưng (gần như) không tồn tại trong DB test.
export const NON_EXISTENT_OBJECT_ID = '507f1f77bcf86cd799439011'

export const getTestApp = () => createApp()

export const registerAndVerifyUser = async (app, email = VALID_EMAIL) => {
  const registerRes = await request(app).post('/v1/users/register').send({
    email,
    password: VALID_PASSWORD
  })

  let user = await userModel.findOneByEmail(email)

  if (registerRes.status === 409) {
    expect(user).toBeTruthy()
    if (user.isActive) return user
  } else {
    expect(registerRes.status).toBe(201)
    user = await userModel.findOneByEmail(email)
    expect(user).toBeTruthy()
  }

  if (user.isActive) return user

  expect(user.verifyToken).toBeTruthy()
  const verifyRes = await request(app).put('/v1/users/verify').send({
    email,
    token: user.verifyToken
  })
  expect(verifyRes.status).toBe(200)

  return userModel.findOneByEmail(email)
}

/** Trả về raw response của login (để kiểm tra Set-Cookie / body). */
export const loginRaw = (app, email = VALID_EMAIL, password = VALID_PASSWORD) =>
  request(app).post('/v1/users/login').send({ email, password })

export const loginUser = async (app, email = VALID_EMAIL) => {
  const agent = request.agent(app)
  const res = await agent.post('/v1/users/login').send({
    email,
    password: VALID_PASSWORD
  })
  expect(res.status).toBe(200)
  return agent
}

/** Đăng ký + verify + login, trả về { agent, user }. */
export const setupAuthedUser = async (app, email = VALID_EMAIL) => {
  const user = await registerAndVerifyUser(app, email)
  const agent = await loginUser(app, email)
  return { agent, user }
}

// ---------- Cookie / JWT helpers ----------

export const getSetCookie = (res) => res.headers['set-cookie'] || []

/** Lấy value của 1 cookie theo tên từ mảng Set-Cookie. */
export const getCookieValue = (setCookieArray, name) => {
  const found = (setCookieArray || []).find((c) => c.startsWith(`${name}=`))
  if (!found) return null
  return found.split(';')[0].split('=').slice(1).join('=')
}

/** Tạo header Cookie 'accessToken=...' để gửi kèm request. */
export const cookieHeaderFromToken = (accessToken) => [
  `accessToken=${accessToken}`
]

/**
 * Ký 1 access token đã hết hạn, dùng ĐÚNG cách JwtProvider tạo (HS256 base64url)
 * để verifier custom nhận diện chữ ký hợp lệ rồi phát hiện exp đã qua → 'jwt expired'.
 */
export const signExpiredAccessToken = (
  payload = { _id: NON_EXISTENT_OBJECT_ID, email: VALID_EMAIL }
) => {
  const base64UrlEncode = (value) => Buffer.from(value).toString('base64url')
  const nowInSeconds = Math.floor(Date.now() / 1000)
  const header = { alg: 'HS256', typ: 'JWT' }
  const body = { ...payload, iat: nowInSeconds - 100, exp: nowInSeconds - 10 }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedBody = base64UrlEncode(JSON.stringify(body))
  const data = `${encodedHeader}.${encodedBody}`
  // Dùng đúng secret mà authMiddleware verify (env chụp lúc import), tránh lệch
  // với process.env được setup.js gán trong beforeAll.
  const signature = crypto
    .createHmac('sha256', env.ACCESS_TOKEN_SECRET_SIGNATURE)
    .update(data)
    .digest('base64url')

  return `${data}.${signature}`
}

// ---------- Factory tạo dữ liệu nghiệp vụ ----------

export const createBoard = async (agent, overrides = {}) => {
  const res = await agent.post('/v1/boards').send({
    title: 'Helper Board',
    description: 'Helper board description',
    type: BOARD_TYPES.PUBLIC,
    ...overrides
  })
  expect(res.status).toBe(201)
  return res.body
}

export const createColumn = async (agent, boardId, title = 'Helper Column') => {
  const res = await agent.post('/v1/columns').send({ boardId, title })
  expect(res.status).toBe(201)
  return res.body
}

export const createCard = async (
  agent,
  boardId,
  columnId,
  title = 'Helper Card'
) => {
  const res = await agent.post('/v1/cards').send({ boardId, columnId, title })
  expect(res.status).toBe(201)
  return res.body
}
