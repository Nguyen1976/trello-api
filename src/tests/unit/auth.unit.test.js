import {
  validateEmail,
  validatePassword,
  generateToken
} from '~/utils/authUtils'

describe('authUtils - unit tests (white box)', () => {
  describe('validateEmail', () => {
    // Nhánh: email null/undefined → throw Error('Email is required')
    it('throws when email is null', () => {
      expect(() => validateEmail(null)).toThrow('Email is required')
    })

    it('throws when email is undefined', () => {
      expect(() => validateEmail(undefined)).toThrow('Email is required')
    })

    // Nhánh: email không có @ → return false
    it('returns false when email has no @ symbol', () => {
      expect(validateEmail('invalidemail.com')).toBe(false)
    })

    // Nhánh: email rỗng → return false (TC-BB-AUTH-04 BVA)
    it('returns false when email is empty string', () => {
      expect(validateEmail('')).toBe(false)
    })

    // BVA: a@ — utils chỉ kiểm tra @ (DEF-SEED-01: lỏng hơn Joi)
    it('returns true for a@ per utils rule (document inconsistency)', () => {
      expect(validateEmail('a@')).toBe(true)
    })

    // Nhánh: email hợp lệ → return true
    it('returns true for a valid email', () => {
      expect(validateEmail('user@example.com')).toBe(true)
    })
  })

  describe('validatePassword', () => {
    // Nhánh: password null → throw Error('Password is required')
    it('throws when password is null', () => {
      expect(() => validatePassword(null)).toThrow('Password is required')
    })

    it('throws when password is undefined', () => {
      expect(() => validatePassword(undefined)).toThrow('Password is required')
    })

    // BVA: length 5 (TC-BB-AUTH-07)
    it('returns TOO_SHORT when password is shorter than 6 characters', () => {
      expect(validatePassword('12345')).toEqual({
        valid: false,
        reason: 'TOO_SHORT'
      })
    })

    // BVA: length 6 (TC-BB-AUTH-08)
    it('returns valid true when password has exactly 6 characters', () => {
      expect(validatePassword('123456')).toEqual({ valid: true })
    })

    // BVA: length 7 (TC-BB-AUTH-09)
    it('returns valid true when password has 7 characters', () => {
      expect(validatePassword('1234567')).toEqual({ valid: true })
    })
  })

  describe('generateToken', () => {
    // Nhánh: userId null → throw Error
    it('throws when userId is null', () => {
      expect(() => generateToken(null)).toThrow('User ID is required')
    })

    it('throws when userId is undefined', () => {
      expect(() => generateToken(undefined)).toThrow('User ID is required')
    })

    // Nhánh: userId hợp lệ → return string JWT bắt đầu bằng 'eyJ'
    it('returns a JWT string starting with eyJ for a valid userId', () => {
      const token = generateToken('507f1f77bcf86cd799439011')
      expect(typeof token).toBe('string')
      expect(token.startsWith('eyJ')).toBe(true)
    })
  })
})
