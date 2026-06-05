import request from 'supertest'
import { StatusCodes } from 'http-status-codes'
import {
  getTestApp,
  setupAuthedUser,
  registerAndVerifyUser,
  createBoard,
  NON_EXISTENT_OBJECT_ID
} from '~/tests/helpers/integrationHelpers'

jest.mock('~/providers/SendEmailProvider', () => ({
  EmailProvider: {
    sendEmail: jest.fn().mockResolvedValue(true)
  }
}))

describe('Invitations API black-box', () => {
  const app = getTestApp()

  // ---------- GET /v1/invitations ----------
  // TC-BB-INV-LIST-01
  it('returns 401 when listing invitations without auth', async () => {
    const res = await request(app).get('/v1/invitations')
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  // TC-BB-INV-LIST-02
  it('returns an array of invitations when authed', async () => {
    const { agent } = await setupAuthedUser(app, 'inv.list@example.com')
    const res = await agent.get('/v1/invitations')
    expect(res.status).toBe(StatusCodes.OK)
    expect(Array.isArray(res.body)).toBe(true)
  })

  // ---------- POST /v1/invitations/board ----------
  // TC-BB-INV-CREATE-01
  it('returns 401 when creating an invitation without auth', async () => {
    const res = await request(app).post('/v1/invitations/board').send({
      inviteeEmail: 'someone@example.com',
      boardId: NON_EXISTENT_OBJECT_ID
    })
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  // TC-BB-INV-CREATE-02
  it('returns 422 when invitation payload is missing fields', async () => {
    const { agent } = await setupAuthedUser(app, 'inv.badbody@example.com')
    const res = await agent.post('/v1/invitations/board').send({})
    expect(res.status).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
  })

  // TC-BB-INV-CREATE-03
  it('returns 404 when invitee does not exist', async () => {
    const { agent } = await setupAuthedUser(app, 'inv.inviter@example.com')
    const board = await createBoard(agent, { title: 'Invite Board' })

    const res = await agent.post('/v1/invitations/board').send({
      inviteeEmail: 'ghost.invitee@example.com',
      boardId: board._id
    })
    expect(res.status).toBe(StatusCodes.NOT_FOUND)
  })

  // TC-BB-INV-CREATE-04
  it('creates a board invitation between two real users', async () => {
    const { agent } = await setupAuthedUser(app, 'inv.owner@example.com')
    const board = await createBoard(agent, { title: 'Shared Board' })
    await registerAndVerifyUser(app, 'inv.invitee@example.com')

    const res = await agent.post('/v1/invitations/board').send({
      inviteeEmail: 'inv.invitee@example.com',
      boardId: board._id
    })
    expect(res.status).toBe(StatusCodes.CREATED)
    expect(res.body.boardInvitation).toBeTruthy()
    expect(res.body.invitee.email).toBe('inv.invitee@example.com')
  })

  // ---------- PUT /v1/invitations/board/:invitationId ----------
  // TC-BB-INV-UPDATE-01
  it('returns 401 when updating an invitation without auth', async () => {
    const res = await request(app)
      .put(`/v1/invitations/board/${NON_EXISTENT_OBJECT_ID}`)
      .send({ status: 'ACCEPTED' })
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED)
  })

  // TC-BB-INV-UPDATE-02
  it('returns 404 when the invitation does not exist', async () => {
    const { agent } = await setupAuthedUser(app, 'inv.update404@example.com')
    const res = await agent
      .put(`/v1/invitations/board/${NON_EXISTENT_OBJECT_ID}`)
      .send({ status: 'ACCEPTED' })
    expect(res.status).toBe(StatusCodes.NOT_FOUND)
  })
})
