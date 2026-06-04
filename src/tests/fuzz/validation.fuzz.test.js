import fc from 'fast-check'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { userValidation } from '~/validations/userValidation'
import { BOARD_TYPES } from '~/utils/constants'

const VALID_OBJECT_ID = '507f1f77bcf86cd799439011'

const buildCtx = (body) => {
  const next = jest.fn()
  return { req: { body, params: {} }, res: {}, next }
}

const expectPass = (next) => {
  expect(next).toHaveBeenCalledTimes(1)
  expect(next.mock.calls[0][0]).toBeUndefined()
}

const expect422 = (next) => {
  expect(next).toHaveBeenCalledTimes(1)
  const err = next.mock.calls[0][0]
  expect(err).toBeDefined()
  expect(err.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY)
}

const normalize = (value, fallback) =>
  String(value).replace(/[^a-zA-Z0-9]/g, '') || fallback

const validEmail = (seed) =>
  `${normalize(seed, 'user').slice(0, 12)}@example.com`
const invalidEmail = (seed) => `${normalize(seed, 'user')}example.com`

const validPassword = (seed) => {
  const core = normalize(seed, 'Password1').slice(0, 6)
  return `Aa1Valid${core}`
}

const invalidPassword = 'weak'

const validTitle = (seed) => {
  const core = normalize(seed, 'Board').slice(0, 20)
  return `${core} Board`.slice(0, 50)
}

const validDescription = (seed) => {
  const core = normalize(seed, 'Description').slice(0, 40)
  return `${core} description`.slice(0, 256)
}

const invalidTitle = 'ab'
const invalidDescription = 'ab'
const invalidType = 'unknown'
const invalidObjectId = 'not-a-valid-id'

describe('validation fuzz (TC-FUZZ-05 to TC-FUZZ-09)', () => {
  it('userValidation.createNew respects required field and format contracts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          includeEmail: fc.boolean(),
          includePassword: fc.boolean(),
          emailValid: fc.boolean(),
          passwordValid: fc.boolean(),
          emailSeed: fc.string(),
          passwordSeed: fc.string()
        }),
        async ({
          includeEmail,
          includePassword,
          emailValid,
          passwordValid,
          emailSeed,
          passwordSeed
        }) => {
          const body = {}

          if (includeEmail) {
            body.email = emailValid
              ? validEmail(emailSeed)
              : invalidEmail(emailSeed)
          }

          if (includePassword) {
            body.password = passwordValid
              ? validPassword(passwordSeed)
              : invalidPassword
          }

          const { req, res, next } = buildCtx(body)
          await userValidation.createNew(req, res, next)

          const shouldPass =
            includeEmail && includePassword && emailValid && passwordValid

          if (shouldPass) {
            expectPass(next)
          } else {
            expect422(next)
          }
        }
      ),
      { numRuns: 300 }
    )
  })

  it('userValidation.update respects optional password rules and allows unknown fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          includeCurrentPassword: fc.boolean(),
          includeNewPassword: fc.boolean(),
          currentPasswordValid: fc.boolean(),
          newPasswordValid: fc.boolean(),
          passwordSeed: fc.string(),
          extraFieldSeed: fc.string()
        }),
        async ({
          includeCurrentPassword,
          includeNewPassword,
          currentPasswordValid,
          newPasswordValid,
          passwordSeed,
          extraFieldSeed
        }) => {
          const body = {
            displayName: `Name ${normalize(extraFieldSeed, 'User').slice(0, 12)}`,
            extraField: extraFieldSeed
          }

          if (includeCurrentPassword) {
            body.current_password = currentPasswordValid
              ? validPassword(passwordSeed)
              : invalidPassword
          }

          if (includeNewPassword) {
            body.new_password = newPasswordValid
              ? validPassword(passwordSeed)
              : invalidPassword
          }

          const { req, res, next } = buildCtx(body)
          await userValidation.update(req, res, next)

          const shouldPass =
            (!includeCurrentPassword || currentPasswordValid) &&
            (!includeNewPassword || newPasswordValid)

          if (shouldPass) {
            expectPass(next)
          } else {
            expect422(next)
          }
        }
      ),
      { numRuns: 300 }
    )
  })

  it('boardValidation.createNew respects required board payload contracts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          includeTitle: fc.boolean(),
          includeDescription: fc.boolean(),
          includeType: fc.boolean(),
          titleValid: fc.boolean(),
          descriptionValid: fc.boolean(),
          typeValid: fc.boolean(),
          seed: fc.string()
        }),
        async ({
          includeTitle,
          includeDescription,
          includeType,
          titleValid,
          descriptionValid,
          typeValid,
          seed
        }) => {
          const body = {}

          if (includeTitle) {
            body.title = titleValid ? validTitle(seed) : invalidTitle
          }

          if (includeDescription) {
            body.description = descriptionValid
              ? validDescription(seed)
              : invalidDescription
          }

          if (includeType) {
            body.type = typeValid ? BOARD_TYPES.PUBLIC : invalidType
          }

          const { req, res, next } = buildCtx(body)
          await boardValidation.createNew(req, res, next)

          const shouldPass =
            includeTitle &&
            includeDescription &&
            includeType &&
            titleValid &&
            descriptionValid &&
            typeValid

          if (shouldPass) {
            expectPass(next)
          } else {
            expect422(next)
          }
        }
      ),
      { numRuns: 300 }
    )
  })

  it('boardValidation.update respects optional field contracts and column order ids', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          includeTitle: fc.boolean(),
          includeDescription: fc.boolean(),
          includeType: fc.boolean(),
          includeColumnOrderIds: fc.boolean(),
          titleValid: fc.boolean(),
          descriptionValid: fc.boolean(),
          typeValid: fc.boolean(),
          columnIdsValid: fc.boolean(),
          seed: fc.string()
        }),
        async ({
          includeTitle,
          includeDescription,
          includeType,
          includeColumnOrderIds,
          titleValid,
          descriptionValid,
          typeValid,
          columnIdsValid,
          seed
        }) => {
          const body = { extraField: seed }

          if (includeTitle) {
            body.title = titleValid ? validTitle(seed) : invalidTitle
          }

          if (includeDescription) {
            body.description = descriptionValid
              ? validDescription(seed)
              : invalidDescription
          }

          if (includeType) {
            body.type = typeValid ? BOARD_TYPES.PRIVATE : invalidType
          }

          if (includeColumnOrderIds) {
            body.columnOrderIds = columnIdsValid
              ? [VALID_OBJECT_ID]
              : [invalidObjectId]
          }

          const { req, res, next } = buildCtx(body)
          await boardValidation.update(req, res, next)

          const shouldPass =
            (!includeTitle || titleValid) &&
            (!includeDescription || descriptionValid) &&
            (!includeType || typeValid) &&
            (!includeColumnOrderIds || columnIdsValid)

          if (shouldPass) {
            expectPass(next)
          } else {
            expect422(next)
          }
        }
      ),
      { numRuns: 300 }
    )
  })

  it('boardValidation.moveCardToDifferentColumn respects required ids and id arrays', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          currentCardIdValid: fc.boolean(),
          prevColumnIdValid: fc.boolean(),
          prevCardOrderIdsValid: fc.boolean(),
          nextColumnIdValid: fc.boolean(),
          nextCardOrderIdsValid: fc.boolean()
        }),
        async ({
          currentCardIdValid,
          prevColumnIdValid,
          prevCardOrderIdsValid,
          nextColumnIdValid,
          nextCardOrderIdsValid
        }) => {
          const body = {
            currentCardId: currentCardIdValid
              ? VALID_OBJECT_ID
              : invalidObjectId,
            prevColumnId: prevColumnIdValid ? VALID_OBJECT_ID : invalidObjectId,
            prevCardOrderIds: prevCardOrderIdsValid
              ? [VALID_OBJECT_ID]
              : [invalidObjectId],
            nextColumnId: nextColumnIdValid ? VALID_OBJECT_ID : invalidObjectId,
            nextCardOrderIds: nextCardOrderIdsValid
              ? [VALID_OBJECT_ID]
              : [invalidObjectId]
          }

          const { req, res, next } = buildCtx(body)
          await boardValidation.moveCardToDifferentColumn(req, res, next)

          const shouldPass =
            currentCardIdValid &&
            prevColumnIdValid &&
            prevCardOrderIdsValid &&
            nextColumnIdValid &&
            nextCardOrderIdsValid

          if (shouldPass) {
            expectPass(next)
          } else {
            expect422(next)
          }
        }
      ),
      { numRuns: 300 }
    )
  })
})
