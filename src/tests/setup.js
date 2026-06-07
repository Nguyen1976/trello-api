import { MongoMemoryServer } from 'mongodb-memory-server'
import { CONNECT_DB, CLOSE_DB, GET_DB } from '~/config/mongodb'

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongoServer.getUri()
  process.env.DATABASE_NAME = 'trello-test-db'

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
