import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import {
  getTestApp,
  registerAndVerifyUser,
  loginRaw,
  getSetCookie
} from '~/tests/helpers/integrationHelpers'

jest.mock('~/providers/SendEmailProvider', () => ({
  EmailProvider: {
    sendEmail: jest.fn().mockResolvedValue(true)
  }
}))

/**
 * Passive security checks ở mức black-box (cùng tinh thần OWASP ZAP passive scan).
 * Đây KHÔNG thay thế cho ZAP daemon scan đầy đủ (xem docs/SECURITY_ZAP.md +
 * security/zap-passive-scan.sh) mà là lớp kiểm tra nhanh chạy trong CI.
 */
describe('Passive security (ZAP-like) black-box', () => {
  const app = getTestApp()

  // TC-SEC-PASSIVE-01
  it('GET /v1/status is healthy and JSON', async () => {
    const res = await request(app).get('/v1/status')
    expect(res.status).toBe(StatusCodes.OK)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(res.body.message).toBeTruthy()
  })

  // TC-SEC-PASSIVE-02
  it('unknown route returns 404', async () => {
    const res = await request(app).get('/v1/this-route-does-not-exist')
    expect(res.status).toBe(StatusCodes.NOT_FOUND)
  })

  // TC-SEC-PASSIVE-03
  it('does not expose the X-Powered-By header (info leak)', async () => {
    const res = await request(app).get('/v1/status')
    expect(res.headers).not.toHaveProperty('x-powered-by')
  })

  // TC-SEC-PASSIVE-04
  it('sets Cache-Control: no-store to avoid caching sensitive responses', async () => {
    const res = await request(app).get('/v1/status')
    expect(res.headers['cache-control']).toBe('no-store')
  })

  // TC-SEC-PASSIVE-05
  it('issues HttpOnly auth cookies on login', async () => {
    await registerAndVerifyUser(app, 'sec.cookie@example.com')
    const res = await loginRaw(app, 'sec.cookie@example.com')
    const setCookie = getSetCookie(res).join(';').toLowerCase()
    expect(setCookie).toContain('httponly')
  })

  // TC-SEC-PASSIVE-06
  it('never leaks password hash in user-facing responses', async () => {
    const email = 'sec.leak@example.com'
    const registerRes = await request(app)
      .post('/v1/users/register')
      .send({ email, password: 'Password1' })
    expect(registerRes.body).not.toHaveProperty('password')

    await registerAndVerifyUser(app, 'sec.leak2@example.com')
    const loginRes = await loginRaw(app, 'sec.leak2@example.com')
    expect(loginRes.body).not.toHaveProperty('password')
    expect(JSON.stringify(loginRes.body)).not.toMatch(/\$2[aby]\$/) // bcrypt hash signature
  })

  // TC-SEC-PASSIVE-07
  it('returns a structured JSON error (no HTML) on auth failure', async () => {
    const res = await request(app).get('/v1/boards')
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
    expect(res.headers['content-type']).toMatch(/application\/json/)
    expect(res.body).toHaveProperty('statusCode', StatusCodes.UNAUTHORIZED)
    expect(res.body).toHaveProperty('message')
  })
})
