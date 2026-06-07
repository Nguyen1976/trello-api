/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment.js'

let trelloDatabaseInstance = null
let mongoClientInstance = null

const getMongoUri = () => process.env.MONGODB_URI ?? env.MONGODB_URI

const getDatabaseName = () => process.env.DATABASE_NAME ?? env.DATABASE_NAME

const createMongoClient = () => {
  const uri = getMongoUri()
  if (!uri) {
    throw new Error('MONGODB_URI is required')
  }

  return new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  })
}

export const CONNECT_DB = async () => {
  if (!mongoClientInstance) {
    mongoClientInstance = createMongoClient()
  }

  await mongoClientInstance.connect()

  trelloDatabaseInstance = mongoClientInstance.db(getDatabaseName())
}

//Có tác dụng export trelloDatabaseInstance khi đã connect thành công và có thể dùng ở nhiều nơi khác nhau
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Call connectDB first!')
  return trelloDatabaseInstance
}

export const CLOSE_DB = async () => {
  if (!mongoClientInstance) return

  await mongoClientInstance.close()
  mongoClientInstance = null
  trelloDatabaseInstance = null
}
