import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import {
  getTestApp,
  setupAuthedUser,
  createBoard,
  createColumn,
  NON_EXISTENT_OBJECT_ID
} from '~/tests/helpers/integrationHelpers'

jest.mock('~/providers/SendEmailProvider', () => ({
  EmailProvider: {
    sendEmail: jest.fn().mockResolvedValue(true)
  }
}))

describe('Columns API black-box', () => {
  const app = getTestApp()

  // ---------- POST /v1/columns ----------
  // TC-BB-COL-CREATE-01
  it('creates a column with valid payload', async () => {
    const { agent } = await setupAuthedUser(app, 'col.create@example.com')
    const board = await createBoard(agent)

    const res = await agent
      .post('/v1/columns')
      .send({ boardId: board._id, title: 'To Do' })
    expect(res.status).toBe(StatusCodes.CREATED)
    expect(res.body.title).toBe('To Do')
    expect(Array.isArray(res.body.cards)).toBe(true)
  })

  // TC-BB-COL-CREATE-02
  it('returns 401 when creating a column without auth', async () => {
    const res = await request(app)
      .post('/v1/columns')
      .send({ boardId: NON_EXISTENT_OBJECT_ID, title: 'No Auth' })
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  // TC-BB-COL-CREATE-03
  it('returns 422 when boardId is not a valid ObjectId', async () => {
    const { agent } = await setupAuthedUser(app, 'col.badboard@example.com')
    const res = await agent
      .post('/v1/columns')
      .send({ boardId: 'not-an-object-id', title: 'Bad Board Id' })
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // TC-BB-COL-CREATE-04 (BVA: 2 chars < min 3)
  it('returns 422 when title is too short', async () => {
    const { agent } = await setupAuthedUser(app, 'col.shorttitle@example.com')
    const board = await createBoard(agent)
    const res = await agent
      .post('/v1/columns')
      .send({ boardId: board._id, title: 'ab' })
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // ---------- PUT /v1/columns/:id ----------
  // TC-BB-COL-UPDATE-01
  it('updates a column title', async () => {
    const { agent } = await setupAuthedUser(app, 'col.update@example.com')
    const board = await createBoard(agent)
    const column = await createColumn(agent, board._id, 'Old Column')

    const res = await agent
      .put(`/v1/columns/${column._id}`)
      .send({ title: 'New Column' })
    expect(res.status).toBe(StatusCodes.OK)
    expect(res.body.title).toBe('New Column')
  })

  // TC-BB-COL-UPDATE-02
  it('returns 401 when updating a column without auth', async () => {
    const res = await request(app)
      .put(`/v1/columns/${NON_EXISTENT_OBJECT_ID}`)
      .send({ title: 'No Auth' })
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  // TC-BB-COL-UPDATE-03
  it('returns 422 when updating with an invalid title', async () => {
    const { agent } = await setupAuthedUser(app, 'col.updatebad@example.com')
    const board = await createBoard(agent)
    const column = await createColumn(agent, board._id)

    const res = await agent
      .put(`/v1/columns/${column._id}`)
      .send({ title: 'ab' })
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // ---------- DELETE /v1/columns/:id ----------
  // TC-BB-COL-DELETE-01
  it('deletes a column', async () => {
    const { agent } = await setupAuthedUser(app, 'col.delete@example.com')
    const board = await createBoard(agent)
    const column = await createColumn(agent, board._id, 'Deletable')

    const res = await agent.delete(`/v1/columns/${column._id}`)
    expect(res.status).toBe(StatusCodes.OK)
    expect(res.body.deleteResult).toBeTruthy()
  })

  // TC-BB-COL-DELETE-02
  it('returns 422 when deleting with an invalid id format', async () => {
    const { agent } = await setupAuthedUser(app, 'col.deletebad@example.com')
    const res = await agent.delete('/v1/columns/not-an-object-id')
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // TC-BB-COL-DELETE-03
  it('returns 401 when deleting a column without auth', async () => {
    const res = await request(app).delete(
      `/v1/columns/${NON_EXISTENT_OBJECT_ID}`
    )
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })
})
