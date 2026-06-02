import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret'

export const validateEmail = (email) => {
  if (email === null || email === undefined) {
    throw new Error('Email is required')
  }

  if (!email.includes('@')) {
    return false
  }

  return true
}

export const validatePassword = (password) => {
  if (password === null || password === undefined) {
    throw new Error('Password is required')
  }

  if (password.length < 6) {
    return { valid: false, reason: 'TOO_SHORT' }
  }

  return { valid: true }
}

export const generateToken = (userId) => {
  if (userId === null || userId === undefined) {
    throw new Error('User ID is required')
  }

  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' })
}
