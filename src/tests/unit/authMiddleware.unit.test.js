import { authMiddleware } from '~/middlewares/authMiddleware'
import { StatusCodes } from 'http-status-codes'
import { JWTProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

jest.mock('~/providers/JwtProvider', () => ({
  JWTProvider: {
    verifyToken: jest.fn()
  }
}))

describe('authMiddleware.isAuthorized (white-box)', () => {
  const next = jest.fn()
  const res = {}

  beforeEach(() => {
    next.mockClear()
    JWTProvider.verifyToken.mockReset()
  })

  // Nhánh: không có cookie
  it('calls next with 401 when accessToken cookie is missing', async () => {
    const req = { cookies: {} }
    await authMiddleware.isAuthorized(req, res, next)
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: StatusCodes.UNAUTHORIZED })
    )
  })

  // Nhánh: token hợp lệ
  it('sets jwtDecoded and calls next when token is valid', async () => {
    JWTProvider.verifyToken.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' })
    const req = { cookies: { accessToken: 'valid-token' } }
    await authMiddleware.isAuthorized(req, res, next)
    expect(req.jwtDecoded).toEqual({ _id: '507f1f77bcf86cd799439011' })
    expect(next).toHaveBeenCalledWith()
  })

  // Nhánh: jwt expired → 410
  it('calls next with 410 when token is expired', async () => {
    JWTProvider.verifyToken.mockRejectedValue(new Error('jwt expired'))
    const req = { cookies: { accessToken: 'expired' } }
    await authMiddleware.isAuthorized(req, res, next)
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: StatusCodes.GONE })
    )
  })

  // Nhánh: lỗi khác (token sai chữ ký, malformed) → 401 (line 38)
  it('calls next with 401 when token is otherwise invalid', async () => {
    JWTProvider.verifyToken.mockRejectedValue(new Error('invalid signature'))
    const req = { cookies: { accessToken: 'bogus' } }
    await authMiddleware.isAuthorized(req, res, next)
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: StatusCodes.UNAUTHORIZED })
    )
  })

  // Nhánh phòng thủ: req.cookies undefined (optional chaining req.cookies?.accessToken)
  it('calls next with 401 when req.cookies is undefined', async () => {
    const req = {}
    await authMiddleware.isAuthorized(req, res, next)
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: StatusCodes.UNAUTHORIZED })
    )
  })
})
