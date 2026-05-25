import crypto from 'crypto'
import ms from 'ms'

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url')

const base64UrlDecode = (value) =>
  Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()

const normalizeTokenLife = (tokenLife) => {
  if (typeof tokenLife === 'number') {
    return tokenLife
  }

  if (typeof tokenLife === 'string') {
    const parsedLife = ms(tokenLife)

    if (typeof parsedLife === 'number') {
      return Math.ceil(parsedLife / 1000)
    }
  }

  return 0
}

const signToken = (payload, secretSignature, tokenLife) => {
  const issuedAt = Math.floor(Date.now() / 1000)
  const expiresIn = normalizeTokenLife(tokenLife)
  const header = { alg: 'HS256', typ: 'JWT' }
  const body = {
    ...payload,
    iat: issuedAt,
    ...(expiresIn > 0 ? { exp: issuedAt + expiresIn } : {})
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedBody = base64UrlEncode(JSON.stringify(body))
  const data = `${encodedHeader}.${encodedBody}`
  const signature = crypto
    .createHmac('sha256', secretSignature)
    .update(data)
    .digest('base64url')

  return `${data}.${signature}`
}

const verifySignature = (token, secretSignature) => {
  const [encodedHeader, encodedBody, signature] = token.split('.')

  if (!encodedHeader || !encodedBody || !signature) {
    throw new Error('invalid token')
  }

  const expectedSignature = crypto
    .createHmac('sha256', secretSignature)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest('base64url')

  const actualSignatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)

  if (
    actualSignatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(actualSignatureBuffer, expectedSignatureBuffer)
  ) {
    throw new Error('invalid token')
  }

  const decodedPayload = JSON.parse(base64UrlDecode(encodedBody))

  if (
    decodedPayload.exp &&
    decodedPayload.exp <= Math.floor(Date.now() / 1000)
  ) {
    throw new Error('jwt expired')
  }

  return decodedPayload
}

const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return signToken(userInfo, secretSignature, tokenLife)
  } catch (error) {
    throw new Error(error)
  }
}

const verifyToken = async (token, secretSignature) => {
  try {
    return verifySignature(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JWTProvider = {
  generateToken,
  verifyToken
}
