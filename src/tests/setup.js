import { MongoMemoryServer } from 'mongodb-memory-server'
import { CONNECT_DB, CLOSE_DB, GET_DB } from '~/config/mongodb'

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongoServer.getUri()
  process.env.DATABASE_NAME = 'trello-test-db'
  process.env.NODE_ENV = 'test'
  process.env.BUILD_MODE = 'dev'
  process.env.WEBSITE_DOMAIN_DEVELOPMENT = 'http://localhost:5173'
  process.env.ACCESS_TOKEN_SECRET_SIGNATURE = 'test-access-secret-key-32chars!!'
  process.env.ACCESS_TOKEN_LIFE = '1h'
  process.env.REFRESH_TOKEN_SECRET_SIGNATURE = 'test-refresh-secret-key-32chars!'
  process.env.REFRESH_TOKEN_LIFE = '7d'
  process.env.AUTHOR = 'Test'

  await CONNECT_DB()
})

afterEach(async () => {
  const db = GET_DB()
  const collections = await db.listCollections().toArray()
  for (const coll of collections) {
    await db.collection(coll.name).deleteMany({})
  }
})

afterAll(async () => {
  await CLOSE_DB()
  if (mongoServer) {
    await mongoServer.stop()
  }
})
