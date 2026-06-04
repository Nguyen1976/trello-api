import fc from 'fast-check'
import { validateEmail, validatePassword } from '~/utils/authUtils'

const unicodeStringArb = fc
  .array(fc.integer({ min: 0, max: 0x10ffff }), { maxLength: 128 })
  .map((codePoints) => String.fromCodePoint(...codePoints))

const authInputArb = fc.oneof(
  fc.string(),
  unicodeStringArb,
  fc.constant(null),
  fc.constant(undefined)
)

describe('authUtils fuzz (TC-FUZZ-01, TC-FUZZ-02)', () => {
  it('validateEmail respects contract for mixed auth inputs', () => {
    fc.assert(
      fc.property(authInputArb, (input) => {
        if (input == null) {
          expect(() => validateEmail(input)).toThrow('Email is required')
          return
        }

        const result = validateEmail(input)

        expect(typeof result).toBe('boolean')
        expect(result).toBe(input.includes('@'))
      }),
      { numRuns: 1000 }
    )
  })

  it('validatePassword respects contract for mixed auth inputs', () => {
    fc.assert(
      fc.property(authInputArb, (input) => {
        if (input == null) {
          expect(() => validatePassword(input)).toThrow('Password is required')
          return
        }

        const result = validatePassword(input)

        if (input.length < 6) {
          expect(result).toEqual({ valid: false, reason: 'TOO_SHORT' })
        } else {
          expect(result).toEqual({ valid: true })
        }
      }),
      { numRuns: 1000 }
    )
  })
})
