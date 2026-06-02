import { boardValidation } from '~/validations/boardValidation'
import { cardValidation } from '~/validations/cardValidation'
import { columnValidation } from '~/validations/columnValidation'
import { userValidation } from '~/validations/userValidation'
import { StatusCodes } from 'http-status-codes'

const VALID_OBJECT_ID = '507f1f77bcf86cd799439011'
const VALID_OBJECT_ID_2 = '507f1f77bcf86cd799439012'
const VALID_OBJECT_ID_3 = '507f1f77bcf86cd799439013'

const buildCtx = body => {
  const next = jest.fn()
  return { req: { body, params: {} }, res: {}, next }
}

const expectPass = next => {
  expect(next).toHaveBeenCalledTimes(1)
  expect(next.mock.calls[0][0]).toBeUndefined()
}

const expect422 = next => {
  expect(next).toHaveBeenCalledTimes(1)
  const err = next.mock.calls[0][0]
  expect(err).toBeDefined()
  expect(err.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
}

describe('boardValidation middleware (white-box)', () => {
  describe('createNew', () => {
    it('passes with valid body', async () => {
      const { req, res, next } = buildCtx({
        title: 'My Board',
        description: 'A real description',
        type: 'public'
      })
      await boardValidation.createNew(req, res, next)
      expectPass(next)
    })

    it('rejects when title too short (BVA, < 3 chars)', async () => {
      const { req, res, next } = buildCtx({
        title: 'ab',
        description: 'A real description',
        type: 'public'
      })
      await boardValidation.createNew(req, res, next)
      expect422(next)
    })

    it('rejects when type is not public/private', async () => {
      const { req, res, next } = buildCtx({
        title: 'A valid title',
        description: 'A real description',
        type: 'unknown'
      })
      await boardValidation.createNew(req, res, next)
      expect422(next)
    })

    it('rejects when required fields missing', async () => {
      const { req, res, next } = buildCtx({})
      await boardValidation.createNew(req, res, next)
      expect422(next)
    })
  })

  describe('update', () => {
    it('passes with partial valid body (allowUnknown)', async () => {
      const { req, res, next } = buildCtx({
        title: 'New title',
        randomField: 'ignored'
      })
      await boardValidation.update(req, res, next)
      expectPass(next)
    })

    it('rejects when columnOrderIds contains invalid ObjectId', async () => {
      const { req, res, next } = buildCtx({
        columnOrderIds: ['not-a-valid-id']
      })
      await boardValidation.update(req, res, next)
      expect422(next)
    })

    it('rejects when description is too short', async () => {
      const { req, res, next } = buildCtx({ description: 'ab' })
      await boardValidation.update(req, res, next)
      expect422(next)
    })
  })

  describe('moveCardToDifferentColumn', () => {
    const validBody = () => ({
      currentCardId: VALID_OBJECT_ID,
      prevColumnId: VALID_OBJECT_ID_2,
      prevCardOrderIds: [VALID_OBJECT_ID],
      nextColumnId: VALID_OBJECT_ID_3,
      nextCardOrderIds: [VALID_OBJECT_ID]
    })

    it('passes when all ids and arrays are valid', async () => {
      const { req, res, next } = buildCtx(validBody())
      await boardValidation.moveCardToDifferentColumn(req, res, next)
      expectPass(next)
    })

    it('rejects when currentCardId is not a valid ObjectId', async () => {
      const body = validBody()
      body.currentCardId = 'invalid'
      const { req, res, next } = buildCtx(body)
      await boardValidation.moveCardToDifferentColumn(req, res, next)
      expect422(next)
    })

    it('rejects when nextCardOrderIds contains invalid id', async () => {
      const body = validBody()
      body.nextCardOrderIds = ['not-an-id']
      const { req, res, next } = buildCtx(body)
      await boardValidation.moveCardToDifferentColumn(req, res, next)
      expect422(next)
    })

    it('rejects when prevColumnId missing', async () => {
      const body = validBody()
      delete body.prevColumnId
      const { req, res, next } = buildCtx(body)
      await boardValidation.moveCardToDifferentColumn(req, res, next)
      expect422(next)
    })
  })
})

describe('cardValidation middleware (white-box)', () => {
  describe('createNew', () => {
    it('passes with valid body', async () => {
      const { req, res, next } = buildCtx({
        boardId: VALID_OBJECT_ID,
        columnId: VALID_OBJECT_ID_2,
        title: 'Card title'
      })
      await cardValidation.createNew(req, res, next)
      expectPass(next)
    })

    it('rejects with invalid boardId', async () => {
      const { req, res, next } = buildCtx({
        boardId: 'bad',
        columnId: VALID_OBJECT_ID_2,
        title: 'Card title'
      })
      await cardValidation.createNew(req, res, next)
      expect422(next)
    })

    it('rejects when title less than 3 chars (BVA)', async () => {
      const { req, res, next } = buildCtx({
        boardId: VALID_OBJECT_ID,
        columnId: VALID_OBJECT_ID_2,
        title: 'ab'
      })
      await cardValidation.createNew(req, res, next)
      expect422(next)
    })
  })

  describe('update', () => {
    it('passes with valid title and description', async () => {
      const { req, res, next } = buildCtx({
        title: 'New title',
        description: 'desc'
      })
      await cardValidation.update(req, res, next)
      expectPass(next)
    })

    it('rejects when title is too short', async () => {
      const { req, res, next } = buildCtx({ title: 'ab' })
      await cardValidation.update(req, res, next)
      expect422(next)
    })
  })
})

describe('columnValidation middleware (white-box)', () => {
  describe('createNew', () => {
    it('passes with valid body', async () => {
      const { req, res, next } = buildCtx({
        boardId: VALID_OBJECT_ID,
        title: 'Column title'
      })
      await columnValidation.createNew(req, res, next)
      expectPass(next)
    })

    it('rejects when boardId is invalid', async () => {
      const { req, res, next } = buildCtx({
        boardId: 'invalid',
        title: 'Column title'
      })
      await columnValidation.createNew(req, res, next)
      expect422(next)
    })
  })

  describe('update', () => {
    it('passes with valid cardOrderIds', async () => {
      const { req, res, next } = buildCtx({
        title: 'A column',
        cardOrderIds: [VALID_OBJECT_ID, VALID_OBJECT_ID_2]
      })
      await columnValidation.update(req, res, next)
      expectPass(next)
    })

    it('rejects when cardOrderIds contains invalid id', async () => {
      const { req, res, next } = buildCtx({ cardOrderIds: ['nope'] })
      await columnValidation.update(req, res, next)
      expect422(next)
    })

    it('rejects when title too short', async () => {
      const { req, res, next } = buildCtx({ title: 'ab' })
      await columnValidation.update(req, res, next)
      expect422(next)
    })
  })

  describe('deleteItem', () => {
    it('passes with valid id in params', async () => {
      const next = jest.fn()
      const req = { params: { id: VALID_OBJECT_ID } }
      await columnValidation.deleteItem(req, {}, next)
      expectPass(next)
    })

    it('rejects when id is invalid', async () => {
      const next = jest.fn()
      const req = { params: { id: 'not-id' } }
      await columnValidation.deleteItem(req, {}, next)
      expect422(next)
    })

    it('rejects when id is missing', async () => {
      const next = jest.fn()
      const req = { params: {} }
      await columnValidation.deleteItem(req, {}, next)
      expect422(next)
    })
  })
})

describe('userValidation middleware (white-box)', () => {
  describe('createNew', () => {
    it('passes with valid email and password', async () => {
      const { req, res, next } = buildCtx({
        email: 'user@example.com',
        password: 'Password1!'
      })
      await userValidation.createNew(req, res, next)
      expectPass(next)
    })

    it('rejects with invalid email format', async () => {
      const { req, res, next } = buildCtx({
        email: 'not-an-email',
        password: 'Password1!'
      })
      await userValidation.createNew(req, res, next)
      expect422(next)
    })

    it('rejects with weak password', async () => {
      const { req, res, next } = buildCtx({
        email: 'user@example.com',
        password: 'weak'
      })
      await userValidation.createNew(req, res, next)
      expect422(next)
    })
  })

  describe('verifyAccount', () => {
    it('passes with valid email and token', async () => {
      const { req, res, next } = buildCtx({
        email: 'user@example.com',
        token: 'token-string'
      })
      await userValidation.verifyAccount(req, res, next)
      expectPass(next)
    })

    it('rejects when token missing', async () => {
      const { req, res, next } = buildCtx({ email: 'user@example.com' })
      await userValidation.verifyAccount(req, res, next)
      expect422(next)
    })

    it('rejects when email format is invalid', async () => {
      const { req, res, next } = buildCtx({
        email: 'invalid',
        token: 'token-string'
      })
      await userValidation.verifyAccount(req, res, next)
      expect422(next)
    })
  })

  describe('login', () => {
    it('passes with valid credentials shape', async () => {
      const { req, res, next } = buildCtx({
        email: 'user@example.com',
        password: 'Password1!'
      })
      await userValidation.login(req, res, next)
      expectPass(next)
    })

    it('rejects with invalid email format', async () => {
      const { req, res, next } = buildCtx({
        email: 'invalid',
        password: 'Password1!'
      })
      await userValidation.login(req, res, next)
      expect422(next)
    })

    it('rejects when password missing', async () => {
      const { req, res, next } = buildCtx({ email: 'user@example.com' })
      await userValidation.login(req, res, next)
      expect422(next)
    })
  })

  describe('update', () => {
    it('passes with valid displayName and password change', async () => {
      const { req, res, next } = buildCtx({
        displayName: 'New Name',
        current_password: 'OldPass1!',
        new_password: 'NewPass1!'
      })
      await userValidation.update(req, res, next)
      expectPass(next)
    })

    it('passes with empty body (all optional, allowUnknown)', async () => {
      const { req, res, next } = buildCtx({})
      await userValidation.update(req, res, next)
      expectPass(next)
    })

    it('passes with allowUnknown extra field', async () => {
      const { req, res, next } = buildCtx({ avatar: 'something' })
      await userValidation.update(req, res, next)
      expectPass(next)
    })

    it('rejects when current_password violates rule', async () => {
      const { req, res, next } = buildCtx({
        displayName: 'X',
        current_password: 'weak'
      })
      await userValidation.update(req, res, next)
      expect422(next)
    })

    it('rejects when new_password violates rule', async () => {
      const { req, res, next } = buildCtx({
        displayName: 'X',
        new_password: 'weak'
      })
      await userValidation.update(req, res, next)
      expect422(next)
    })
  })
})
