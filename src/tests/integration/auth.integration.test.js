import request from 'supertest'
import { getTestApp, VALID_EMAIL, VALID_PASSWORD, registerAndVerifyUser, loginUser } from '~/tests/helpers/integrationHelpers'

jest.mock('~/providers/SendEmailProvider', () => ({
  EmailProvider: {
    sendEmail: jest.fn().mockResolvedValue(true)
  }
}))

describe('auth integration (black-box API)', () => {
  const app = getTestApp()

  // TC-INT-AUTH-04 — REQ-AUTH-02
  it('returns 422 when register body is invalid', async () => {
    const res = await request(app).post('/v1/users/register').send({
      email: 'bad-email',
      password: 'short'
    })
    expect(res.status).toBe(422)
  })

  // TC-INT-AUTH-01 — REQ-AUTH-01
  it('registers a new user with valid data', async () => {
    const res = await request(app).post('/v1/users/register').send({
      email: 'newuser@example.com',
      password: VALID_PASSWORD
    })
    expect(res.status).toBe(201)
    expect(res.body.email).toBe('newuser@example.com')
  })

  // TC-INT-AUTH-02, TC-INT-AUTH-03
  it('verifies account and logs in with cookies', async () => {
    await registerAndVerifyUser(app, 'verified@example.com')
    const agent = await loginUser(app, 'verified@example.com')
    const boardsRes = await agent.get('/v1/boards')
    expect(boardsRes.status).toBe(200)
  })
})
