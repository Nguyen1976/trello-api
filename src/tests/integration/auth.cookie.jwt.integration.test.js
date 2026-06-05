import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import {
  getTestApp,
  registerAndVerifyUser,
  loginRaw,
  loginUser,
  getSetCookie,
  getCookieValue,
  cookieHeaderFromToken,
  signExpiredAccessToken,
  VALID_PASSWORD
} from '~/tests/helpers/integrationHelpers'
import { userModel } from '~/models/userModel'

jest.mock('~/providers/SendEmailProvider', () => ({
  EmailProvider: {
    sendEmail: jest.fn().mockResolvedValue(true)
  }
}))

describe('Auth / Cookie / JWT black-box API', () => {
  const app = getTestApp()

  // ===================== REGISTER =====================
  describe('POST /v1/users/register', () => {
    // TC-BB-REG-01
    it('registers a valid user and never returns the password', async () => {
      const res = await request(app).post('/v1/users/register').send({
        email: 'reg.valid@example.com',
        password: VALID_PASSWORD
      })
      expect(res.status).toBe(StatusCodes.CREATED)
      expect(res.body.email).toBe('reg.valid@example.com')
      expect(res.body).not.toHaveProperty('password')
      expect(res.body).not.toHaveProperty('verifyToken')
    })

    // TC-BB-REG-02
    it('returns 409 when email already exists', async () => {
      await request(app).post('/v1/users/register').send({
        email: 'reg.dup@example.com',
        password: VALID_PASSWORD
      })
      const res = await request(app).post('/v1/users/register').send({
        email: 'reg.dup@example.com',
        password: VALID_PASSWORD
      })
      expect(res.status).toBe(StatusCodes.CONFLICT)
    })

    // TC-BB-REG-03
    it('returns 422 when email format is invalid', async () => {
      const res = await request(app).post('/v1/users/register').send({
        email: 'not-an-email',
        password: VALID_PASSWORD
      })
      expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
    })

    // TC-BB-REG-04
    it('returns 422 when password is too weak', async () => {
      const res = await request(app).post('/v1/users/register').send({
        email: 'reg.weak@example.com',
        password: 'short'
      })
      expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
    })

    // TC-BB-REG-05
    it('returns 422 when required fields are missing', async () => {
      const res = await request(app).post('/v1/users/register').send({})
      expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
    })
  })

  // ===================== VERIFY =====================
  describe('PUT /v1/users/verify', () => {
    // TC-BB-VER-01
    it('activates the account with a valid token', async () => {
      const email = 'verify.ok@example.com'
      await request(app)
        .post('/v1/users/register')
        .send({ email, password: VALID_PASSWORD })
      const user = await userModel.findOneByEmail(email)

      const res = await request(app)
        .put('/v1/users/verify')
        .send({ email, token: user.verifyToken })
      expect(res.status).toBe(StatusCodes.OK)
      expect(res.body.isActive).toBe(true)
    })

    // TC-BB-VER-02
    it('returns 406 when token is invalid', async () => {
      const email = 'verify.badtoken@example.com'
      await request(app)
        .post('/v1/users/register')
        .send({ email, password: VALID_PASSWORD })

      const res = await request(app)
        .put('/v1/users/verify')
        .send({ email, token: 'wrong-token' })
      expect(res.status).toBe(StatusCodes.NOT_ACCEPTABLE)
    })

    // TC-BB-VER-03
    it('returns 406 when account is already active', async () => {
      const email = 'verify.already@example.com'
      await registerAndVerifyUser(app, email)

      const res = await request(app).put('/v1/users/verify').send({
        email,
        token: '00000000-0000-0000-0000-000000000000'
      })
      expect(res.status).toBe(StatusCodes.NOT_ACCEPTABLE)
    })

    // TC-BB-VER-04
    it('returns 404 when account does not exist', async () => {
      const res = await request(app).put('/v1/users/verify').send({
        email: 'verify.ghost@example.com',
        token: 'any-token'
      })
      expect(res.status).toBe(StatusCodes.NOT_FOUND)
    })

    // TC-BB-VER-05
    it('returns 422 when body is invalid', async () => {
      const res = await request(app)
        .put('/v1/users/verify')
        .send({ email: 'bad-email' })
      expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
    })
  })

  // ===================== LOGIN + COOKIE =====================
  describe('POST /v1/users/login', () => {
    // TC-BB-LOGIN-01 + cookie/JWT
    it('logs in and sets httpOnly access/refresh cookies', async () => {
      await registerAndVerifyUser(app, 'login.ok@example.com')
      const res = await loginRaw(app, 'login.ok@example.com')

      expect(res.status).toBe(StatusCodes.OK)
      expect(res.body).toHaveProperty('accessToken')
      expect(res.body).toHaveProperty('refreshToken')
      expect(res.body).not.toHaveProperty('password')

      const setCookie = getSetCookie(res)
      const accessCookie = setCookie.find((c) => c.startsWith('accessToken='))
      const refreshCookie = setCookie.find((c) => c.startsWith('refreshToken='))
      expect(accessCookie).toBeDefined()
      expect(refreshCookie).toBeDefined()
      // Cookie phải là HttpOnly (chống XSS đọc token) — OWASP best practice.
      expect(accessCookie.toLowerCase()).toContain('httponly')
      expect(refreshCookie.toLowerCase()).toContain('httponly')
    })

    // TC-BB-LOGIN-02
    it('returns 406 when password is wrong', async () => {
      await registerAndVerifyUser(app, 'login.wrongpass@example.com')
      const res = await loginRaw(app, 'login.wrongpass@example.com', 'Wrongpass1')
      expect(res.status).toBe(StatusCodes.NOT_ACCEPTABLE)
    })

    // TC-BB-LOGIN-03
    it('returns 406 when account is not verified yet', async () => {
      await request(app).post('/v1/users/register').send({
        email: 'login.inactive@example.com',
        password: VALID_PASSWORD
      })
      const res = await loginRaw(app, 'login.inactive@example.com')
      expect(res.status).toBe(StatusCodes.NOT_ACCEPTABLE)
    })

    // TC-BB-LOGIN-04
    it('returns 404 when account does not exist', async () => {
      const res = await loginRaw(app, 'login.ghost@example.com')
      expect(res.status).toBe(StatusCodes.NOT_FOUND)
    })

    // TC-BB-LOGIN-05
    it('returns 422 when credentials format is invalid', async () => {
      const res = await request(app)
        .post('/v1/users/login')
        .send({ email: 'bad', password: 'x' })
      expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
    })
  })

  // ===================== LOGOUT =====================
  describe('DELETE /v1/users/logout', () => {
    // TC-BB-LOGOUT-01
    it('clears auth cookies and returns loggedOut', async () => {
      const res = await request(app).delete('/v1/users/logout')
      expect(res.status).toBe(StatusCodes.OK)
      expect(res.body).toEqual({ loggedOut: true })

      const setCookie = getSetCookie(res)
      // clearCookie phát hành Set-Cookie với thời hạn ở quá khứ.
      const cleared = setCookie.join(';').toLowerCase()
      expect(cleared).toContain('accesstoken=')
      expect(cleared).toContain('refreshtoken=')
    })
  })

  // ===================== REFRESH TOKEN =====================
  describe('GET /v1/users/refresh_token', () => {
    // TC-BB-REFRESH-01
    it('issues a new access token with a valid refresh cookie', async () => {
      await registerAndVerifyUser(app, 'refresh.ok@example.com')
      const loginRes = await loginRaw(app, 'refresh.ok@example.com')
      const refreshToken = getCookieValue(
        getSetCookie(loginRes),
        'refreshToken'
      )

      const res = await request(app)
        .get('/v1/users/refresh_token')
        .set('Cookie', [`refreshToken=${refreshToken}`])

      expect(res.status).toBe(StatusCodes.OK)
      expect(res.body).toHaveProperty('accessToken')
    })

    // TC-BB-REFRESH-02
    it('returns 403 when refresh cookie is missing', async () => {
      const res = await request(app).get('/v1/users/refresh_token')
      expect(res.status).toBe(StatusCodes.FORBIDDEN)
    })

    // TC-BB-REFRESH-03
    it('returns 403 when refresh token is invalid', async () => {
      const res = await request(app)
        .get('/v1/users/refresh_token')
        .set('Cookie', ['refreshToken=garbage.token.value'])
      expect(res.status).toBe(StatusCodes.FORBIDDEN)
    })
  })

  // ===================== JWT PROTECTION =====================
  describe('JWT-protected access (via /v1/boards)', () => {
    // TC-BB-JWT-01
    it('returns 401 when no token cookie is provided', async () => {
      const res = await request(app).get('/v1/boards')
      expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
    })

    // TC-BB-JWT-02
    it('returns 401 when token is malformed', async () => {
      const res = await request(app)
        .get('/v1/boards')
        .set('Cookie', cookieHeaderFromToken('not-a-valid-jwt'))
      expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
    })

    // TC-BB-JWT-03
    it('returns 401 when token signature is tampered', async () => {
      await registerAndVerifyUser(app, 'jwt.tamper@example.com')
      const loginRes = await loginRaw(app, 'jwt.tamper@example.com')
      const accessToken = getCookieValue(getSetCookie(loginRes), 'accessToken')
      // Đổi ký tự cuối → sai chữ ký.
      const tampered = accessToken.slice(0, -1) + (accessToken.endsWith('a') ? 'b' : 'a')

      const res = await request(app)
        .get('/v1/boards')
        .set('Cookie', cookieHeaderFromToken(tampered))
      expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
    })

    // TC-BB-JWT-04
    it('returns 410 (need refresh) when token is expired', async () => {
      const expired = signExpiredAccessToken()
      const res = await request(app)
        .get('/v1/boards')
        .set('Cookie', cookieHeaderFromToken(expired))
      expect(res.status).toBe(StatusCodes.GONE)
    })

    // TC-BB-JWT-05
    it('grants access with a valid token cookie', async () => {
      await registerAndVerifyUser(app, 'jwt.valid@example.com')
      const loginRes = await loginRaw(app, 'jwt.valid@example.com')
      const accessToken = getCookieValue(getSetCookie(loginRes), 'accessToken')

      const res = await request(app)
        .get('/v1/boards')
        .set('Cookie', cookieHeaderFromToken(accessToken))
      expect(res.status).toBe(StatusCodes.OK)
    })
  })

  // ===================== UPDATE (protected) =====================
  describe('PUT /v1/users/update', () => {
    // TC-BB-UPDATE-01
    it('returns 401 without authentication', async () => {
      const res = await request(app)
        .put('/v1/users/update')
        .send({ displayName: 'No Auth' })
      expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
    })

    // TC-BB-UPDATE-02
    it('updates displayName when authenticated', async () => {
      await registerAndVerifyUser(app, 'update.ok@example.com')
      const agent = await loginUser(app, 'update.ok@example.com')

      const res = await agent
        .put('/v1/users/update')
        .send({ displayName: 'Updated Name' })
      expect(res.status).toBe(StatusCodes.OK)
      expect(res.body).not.toHaveProperty('password')
    })
  })
})
