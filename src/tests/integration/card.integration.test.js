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

describe('card integration', () => {
  const app = getTestApp()

  // TC-INT-CARD-01 — REQ-CARD-01
  it('creates a card in a column', async () => {
    const email = 'card@example.com'
    await registerAndVerifyUser(app, email)
    const agent = await loginUser(app, email)

    const boardRes = await agent.post('/v1/boards').send({
      title: 'Card Board',
      description: 'desc',
      type: BOARD_TYPES.PUBLIC
    })
    const boardId = boardRes.body._id

    const colRes = await agent.post('/v1/columns').send({
      boardId,
      title: 'Doing'
    })
    const columnId = colRes.body._id

    const cardRes = await agent.post('/v1/cards').send({
      boardId,
      columnId,
      title: 'My first card'
    })
    expect(cardRes.status).toBe(StatusCodes.CREATED)
    expect(cardRes.body.title).toBe('My first card')
  })
})
