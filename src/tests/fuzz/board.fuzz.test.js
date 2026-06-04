import fc from 'fast-check'
import { validateBoardTitle } from '~/utils/boardUtils'

const unicodeTitleArb = fc
  .array(fc.integer({ min: 0, max: 0x10ffff }), { maxLength: 256 })
  .map((codePoints) => String.fromCodePoint(...codePoints))

const boardTitleArb = fc.oneof(
  fc.string(),
  unicodeTitleArb,
  fc.constant(null),
  fc.constant(undefined)
)

describe('boardUtils fuzz (TC-FUZZ-03)', () => {
  it('validateBoardTitle respects contract for mixed title inputs', () => {
    fc.assert(
      fc.property(boardTitleArb, (title) => {
        const result = validateBoardTitle(title)

        if (title == null || title === '') {
          expect(result).toEqual({ valid: false, error: 'EMPTY_TITLE' })
          return
        }

        if (title.length > 255) {
          expect(result).toEqual({ valid: false, error: 'TOO_LONG' })
          return
        }

        expect(result).toEqual({ valid: true })
      }),
      { numRuns: 1000 }
    )
  })
})
