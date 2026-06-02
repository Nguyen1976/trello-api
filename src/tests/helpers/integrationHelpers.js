import request from 'supertest'
import { createApp } from '~/app'
import { userModel } from '~/models/userModel'

export const VALID_PASSWORD = 'Password1'
export const VALID_EMAIL = 'testuser@example.com'

export const getTestApp = () => createApp()

export const registerAndVerifyUser = async (app, email = VALID_EMAIL) => {
  const registerRes = await request(app).post('/v1/users/register').send({
    email,
    password: VALID_PASSWORD
  })
  expect(registerRes.status).toBe(201)

  const user = await userModel.findOneByEmail(email)

  const verifyRes = await request(app).put('/v1/users/verify').send({
    email,
    token: user.verifyToken
  })
  expect(verifyRes.status).toBe(200)

  return user
}

export const loginUser = async (app, email = VALID_EMAIL) => {
  const agent = request.agent(app)
  const res = await agent.post('/v1/users/login').send({
    email,
    password: VALID_PASSWORD
  })
  expect(res.status).toBe(200)
  return agent
}
