import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { BOARD_TYPES } from '~/utils/constants'
import {
  getTestApp,
  registerAndVerifyUser,
  loginUser,
  VALID_EMAIL
} from '~/tests/helpers/integrationHelpers'

jest.mock('~/providers/SendEmailProvider', () => ({
  EmailProvider: {
    sendEmail: jest.fn().mockResolvedValue(true)
  }
}))

describe('board integration', () => {
  const app = getTestApp()

  // TC-INT-BOARD-01 — REQ-AUTH-05
  it('returns 401 when listing boards without auth', async () => {
    const res = await request(app).get('/v1/boards')
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  // TC-INT-BOARD-02, TC-INT-BOARD-03
  it('creates and fetches board details when authenticated', async () => {
    await registerAndVerifyUser(app, VALID_EMAIL)
    const agent = await loginUser(app, VALID_EMAIL)

    const createRes = await agent.post('/v1/boards').send({
      title: 'My Test Board',
      description: 'Integration test board',
      type: BOARD_TYPES.PUBLIC
    })
    expect(createRes.status).toBe(StatusCodes.CREATED)

    const boardId = createRes.body._id
    const detailRes = await agent.get(`/v1/boards/${boardId}`)
    expect(detailRes.status).toBe(StatusCodes.OK)
    expect(detailRes.body.title).toBe('My Test Board')
  })

  // TC-BB-BOARD-01 — REQ-BOARD-02
  it('returns 422 when board title is too short', async () => {
    await registerAndVerifyUser(app, 'boardshort@example.com')
    const agent = await loginUser(app, 'boardshort@example.com')

    const res = await agent.post('/v1/boards').send({
      title: 'ab',
      description: 'desc',
      type: BOARD_TYPES.PUBLIC
    })
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })
})
