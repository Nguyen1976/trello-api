import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import { BOARD_TYPES } from '~/utils/constants'
import {
  getTestApp,
  setupAuthedUser,
  createBoard,
  NON_EXISTENT_OBJECT_ID
} from '~/tests/helpers/integrationHelpers'

jest.mock('~/providers/SendEmailProvider', () => ({
  EmailProvider: {
    sendEmail: jest.fn().mockResolvedValue(true)
  }
}))

describe('Boards API black-box', () => {
  const app = getTestApp()

  // ---------- GET /v1/boards ----------
  // TC-BB-BOARDS-LIST-01
  it('returns 401 when listing boards without auth', async () => {
    const res = await request(app).get('/v1/boards')
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  // TC-BB-BOARDS-LIST-02
  it('returns paginated boards shape when authed', async () => {
    const { agent } = await setupAuthedUser(app, 'boards.list@example.com')
    await createBoard(agent, { title: 'Listed Board' })

    const res = await agent.get('/v1/boards')
    expect(res.status).toBe(StatusCodes.OK)
    expect(Array.isArray(res.body.boards)).toBe(true)
    expect(res.body).toHaveProperty('totalBoards')
    expect(res.body.boards.length).toBeGreaterThanOrEqual(1)
  })

  // ---------- POST /v1/boards ----------
  // TC-BB-BOARDS-CREATE-01
  it('creates a board with valid payload', async () => {
    const { agent } = await setupAuthedUser(app, 'boards.create@example.com')
    const res = await agent.post('/v1/boards').send({
      title: 'Valid Board',
      description: 'Valid description',
      type: BOARD_TYPES.PRIVATE
    })
    expect(res.status).toBe(StatusCodes.CREATED)
    expect(res.body._id).toBeTruthy()
    expect(res.body.title).toBe('Valid Board')
  })

  // TC-BB-BOARDS-CREATE-02
  it('returns 401 when creating a board without auth', async () => {
    const res = await request(app).post('/v1/boards').send({
      title: 'No Auth Board',
      description: 'desc',
      type: BOARD_TYPES.PUBLIC
    })
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  // TC-BB-BOARDS-CREATE-03
  it('returns 422 when type is missing', async () => {
    const { agent } = await setupAuthedUser(app, 'boards.notype@example.com')
    const res = await agent.post('/v1/boards').send({
      title: 'No Type Board',
      description: 'desc'
    })
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // TC-BB-BOARDS-CREATE-04
  it('returns 422 when description is too short', async () => {
    const { agent } = await setupAuthedUser(app, 'boards.shortdesc@example.com')
    const res = await agent.post('/v1/boards').send({
      title: 'Short Desc Board',
      description: 'ab',
      type: BOARD_TYPES.PUBLIC
    })
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // TC-BB-BOARDS-CREATE-05 (BVA: title 51 chars > max 50)
  it('returns 422 when title exceeds 50 characters', async () => {
    const { agent } = await setupAuthedUser(app, 'boards.longtitle@example.com')
    const res = await agent.post('/v1/boards').send({
      title: 'a'.repeat(51),
      description: 'valid description',
      type: BOARD_TYPES.PUBLIC
    })
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // ---------- GET /v1/boards/:id ----------
  // TC-BB-BOARDS-DETAIL-01
  it('returns board details for the owner', async () => {
    const { agent } = await setupAuthedUser(app, 'boards.detail@example.com')
    const board = await createBoard(agent, { title: 'Detail Board' })

    const res = await agent.get(`/v1/boards/${board._id}`)
    expect(res.status).toBe(StatusCodes.OK)
    expect(res.body.title).toBe('Detail Board')
    expect(Array.isArray(res.body.columns)).toBe(true)
  })

  // TC-BB-BOARDS-DETAIL-02
  it('returns 401 when fetching details without auth', async () => {
    const res = await request(app).get(`/v1/boards/${NON_EXISTENT_OBJECT_ID}`)
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  // TC-BB-BOARDS-DETAIL-03
  it('returns 404 for a board the user cannot access', async () => {
    const { agent } = await setupAuthedUser(app, 'boards.detail404@example.com')
    const res = await agent.get(`/v1/boards/${NON_EXISTENT_OBJECT_ID}`)
    expect(res.status).toBe(StatusCodes.NOT_FOUND)
  })

  // ---------- PUT /v1/boards/:id ----------
  // TC-BB-BOARDS-UPDATE-01
  it('updates a board title', async () => {
    const { agent } = await setupAuthedUser(app, 'boards.update@example.com')
    const board = await createBoard(agent, { title: 'Before Update' })

    const res = await agent
      .put(`/v1/boards/${board._id}`)
      .send({ title: 'After Update' })
    expect(res.status).toBe(StatusCodes.OK)
    expect(res.body.title).toBe('After Update')
  })

  // TC-BB-BOARDS-UPDATE-02
  it('returns 422 when updating with an invalid title', async () => {
    const { agent } = await setupAuthedUser(app, 'boards.updatebad@example.com')
    const board = await createBoard(agent)

    const res = await agent.put(`/v1/boards/${board._id}`).send({ title: 'ab' })
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // TC-BB-BOARDS-UPDATE-03
  it('returns 401 when updating without auth', async () => {
    const res = await request(app)
      .put(`/v1/boards/${NON_EXISTENT_OBJECT_ID}`)
      .send({ title: 'No Auth Update' })
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  // ---------- PUT /v1/boards/supports/moving_card ----------
  // TC-BB-BOARDS-MOVE-01
  it('returns 401 for moving card without auth', async () => {
    const res = await request(app)
      .put('/v1/boards/supports/moving_card')
      .send({})
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  // TC-BB-BOARDS-MOVE-02
  it('returns 422 when moving card payload is invalid', async () => {
    const { agent } = await setupAuthedUser(app, 'boards.move@example.com')
    const res = await agent.put('/v1/boards/supports/moving_card').send({})
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // TC-BB-BOARDS-MOVE-03
  it('moves a card between columns with a valid payload', async () => {
    const { agent } = await setupAuthedUser(app, 'boards.movecard@example.com')
    const board = await createBoard(agent, { title: 'Move Card Board' })

    const colA = await agent
      .post('/v1/columns')
      .send({ boardId: board._id, title: 'Column A' })
    const colB = await agent
      .post('/v1/columns')
      .send({ boardId: board._id, title: 'Column B' })

    const card = await agent.post('/v1/cards').send({
      boardId: board._id,
      columnId: colA.body._id,
      title: 'Movable card'
    })

    const res = await agent.put('/v1/boards/supports/moving_card').send({
      currentCardId: card.body._id,
      prevColumnId: colA.body._id,
      prevCardOrderIds: [],
      nextColumnId: colB.body._id,
      nextCardOrderIds: [card.body._id]
    })
    expect(res.status).toBe(StatusCodes.OK)
    expect(res.body.updateResult).toBeTruthy()
  })
})
