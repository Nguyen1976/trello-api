import { validateBoardTitle } from '~/utils/boardUtils'

describe('boardUtils - validateBoardTitle (white box)', () => {
  // Nhánh: title rỗng '' → return { valid: false, error: 'EMPTY_TITLE' }
  it('returns EMPTY_TITLE when title is empty string', () => {
    expect(validateBoardTitle('')).toEqual({
      valid: false,
      error: 'EMPTY_TITLE'
    })
  })

  // Nhánh: title.length > 255 → return { valid: false, error: 'TOO_LONG' }
  it('returns TOO_LONG when title exceeds 255 characters', () => {
    const longTitle = 'a'.repeat(256)
    expect(validateBoardTitle(longTitle)).toEqual({
      valid: false,
      error: 'TOO_LONG'
    })
  })

  // Nhánh: title hợp lệ → return { valid: true }
  it('returns valid true for a normal title', () => {
    expect(validateBoardTitle('My Trello Board')).toEqual({ valid: true })
  })

  it('returns valid true for title at max length 255', () => {
    const maxTitle = 'a'.repeat(255)
    expect(validateBoardTitle(maxTitle)).toEqual({ valid: true })
  })

  // BVA: 1 character title (TC-WB-BOARD-04)
  it('returns valid true for single character title', () => {
    expect(validateBoardTitle('a')).toEqual({ valid: true })
  })
})
