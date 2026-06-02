import Joi from 'joi'

// Black-box trên spec Joi column title (REQ-COL-02) — TC-BB-LIST-01..04
const columnTitleSchema = Joi.string().required().min(3).max(50).trim().strict()

describe('column title Joi schema (black-box EP/BVA)', () => {
  it('rejects title with 2 characters', () => {
    const { error } = columnTitleSchema.validate('ab')
    expect(error).toBeDefined()
  })

  it('accepts title with 3 characters', () => {
    const { error } = columnTitleSchema.validate('abc')
    expect(error).toBeUndefined()
  })

  it('accepts title with 50 characters', () => {
    const { error } = columnTitleSchema.validate('a'.repeat(50))
    expect(error).toBeUndefined()
  })

  it('rejects title with 51 characters', () => {
    const { error } = columnTitleSchema.validate('a'.repeat(51))
    expect(error).toBeDefined()
  })
})
