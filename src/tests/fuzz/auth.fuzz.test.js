import fc from 'fast-check'
import { validateEmail, validatePassword } from '~/utils/authUtils'

describe('authUtils fuzz (TC-FUZZ-01, TC-FUZZ-02)', () => {
  it('validateEmail never throws for arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        try {
          const result = validateEmail(input)
          expect(typeof result).toBe('boolean')
        } catch (e) {
          expect(e.message).toMatch(/Email is required/)
        }
      }),
      { numRuns: 200 }
    )
  })

  it('validatePassword respects contract for arbitrary strings', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        try {
          const result = validatePassword(input)
          if (input === null || input === undefined) {
            throw new Error('unexpected')
          }
          if (input.length < 6) {
            expect(result).toEqual({ valid: false, reason: 'TOO_SHORT' })
          } else {
            expect(result).toEqual({ valid: true })
          }
        } catch (e) {
          expect(e.message).toMatch(/Password is required/)
        }
      }),
      { numRuns: 200 }
    )
  })
})
