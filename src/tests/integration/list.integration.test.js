import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { BOARD_TYPES } from '~/utils/constants'
import {
  getTestApp,
  registerAndVerifyUser,
  loginUser
} from '~/tests/helpers/integrationHelpers'

jest.mock('~/providers/SendEmailProvider', () => ({
  EmailProvider: {
    sendEmail: jest.fn().mockResolvedValue(true)
  }
}))

describe('column (list) integration', () => {
  const app = getTestApp()

  // TC-INT-LIST-01 — REQ-COL-01
  it('creates a column on a board', async () => {
    const email = 'column@example.com'
    await registerAndVerifyUser(app, email)
    const agent = await loginUser(app, email)

    const boardRes = await agent.post('/v1/boards').send({
      title: 'Board For Columns',
      description: 'desc',
      type: BOARD_TYPES.PUBLIC
    })
    const boardId = boardRes.body._id

    const colRes = await agent.post('/v1/columns').send({
      boardId,
      title: 'Todo Column'
    })
    expect(colRes.status).toBe(StatusCodes.CREATED)
    expect(colRes.body.title).toBe('Todo Column')
  })

  // TC-BB-LIST-01 — REQ-COL-02 BVA title too short
  it('returns 422 when column title has 2 characters', async () => {
    const email = 'columnbva@example.com'
    await registerAndVerifyUser(app, email)
    const agent = await loginUser(app, email)

    const boardRes = await agent.post('/v1/boards').send({
      title: 'BVA Board',
      description: 'desc',
      type: BOARD_TYPES.PUBLIC
    })

    const res = await agent.post('/v1/columns').send({
      boardId: boardRes.body._id,
      title: 'ab'
    })
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })
})
