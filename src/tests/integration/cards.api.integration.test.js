import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import {
  getTestApp,
  setupAuthedUser,
  createBoard,
  createColumn,
  createCard,
  NON_EXISTENT_OBJECT_ID
} from '~/tests/helpers/integrationHelpers'

jest.mock('~/providers/SendEmailProvider', () => ({
  EmailProvider: {
    sendEmail: jest.fn().mockResolvedValue(true)
  }
}))

describe('Cards API black-box', () => {
  const app = getTestApp()

  // ---------- POST /v1/cards ----------
  // TC-BB-CARD-CREATE-01
  it('creates a card with valid payload', async () => {
    const { agent } = await setupAuthedUser(app, 'card.create@example.com')
    const board = await createBoard(agent)
    const column = await createColumn(agent, board._id)

    const res = await agent.post('/v1/cards').send({
      boardId: board._id,
      columnId: column._id,
      title: 'First card'
    })
    expect(res.status).toBe(StatusCodes.CREATED)
    expect(res.body.title).toBe('First card')
  })

  // TC-BB-CARD-CREATE-02
  it('returns 401 when creating a card without auth', async () => {
    const res = await request(app).post('/v1/cards').send({
      boardId: NON_EXISTENT_OBJECT_ID,
      columnId: NON_EXISTENT_OBJECT_ID,
      title: 'No Auth'
    })
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  // TC-BB-CARD-CREATE-03
  it('returns 422 when columnId is missing', async () => {
    const { agent } = await setupAuthedUser(app, 'card.nocolumn@example.com')
    const board = await createBoard(agent)
    const res = await agent.post('/v1/cards').send({
      boardId: board._id,
      title: 'Missing column'
    })
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // TC-BB-CARD-CREATE-04
  it('returns 422 when boardId is not a valid ObjectId', async () => {
    const { agent } = await setupAuthedUser(app, 'card.badboard@example.com')
    const res = await agent.post('/v1/cards').send({
      boardId: 'not-an-object-id',
      columnId: NON_EXISTENT_OBJECT_ID,
      title: 'Bad board id'
    })
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // TC-BB-CARD-CREATE-05 (BVA: 2 chars < min 3)
  it('returns 422 when title is too short', async () => {
    const { agent } = await setupAuthedUser(app, 'card.shorttitle@example.com')
    const board = await createBoard(agent)
    const column = await createColumn(agent, board._id)
    const res = await agent.post('/v1/cards').send({
      boardId: board._id,
      columnId: column._id,
      title: 'ab'
    })
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // ---------- PUT /v1/cards/:id ----------
  // TC-BB-CARD-UPDATE-01
  it('updates a card title', async () => {
    const { agent } = await setupAuthedUser(app, 'card.update@example.com')
    const board = await createBoard(agent)
    const column = await createColumn(agent, board._id)
    const card = await createCard(agent, board._id, column._id, 'Old title')

    const res = await agent
      .put(`/v1/cards/${card._id}`)
      .send({ title: 'New title' })
    expect(res.status).toBe(StatusCodes.OK)
    expect(res.body.title).toBe('New title')
  })

  // TC-BB-CARD-UPDATE-02
  it('returns 401 when updating a card without auth', async () => {
    const res = await request(app)
      .put(`/v1/cards/${NON_EXISTENT_OBJECT_ID}`)
      .send({ title: 'No Auth' })
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})
