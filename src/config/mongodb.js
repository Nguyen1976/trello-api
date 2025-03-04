/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment.js'

let trelloDatabaseInstance = null

//Khời tạo 1 đói tượng ClientInstance để connect tới mongodb
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()

  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

//Có tác dụng export trelloDatabaseInstance khi đã connect thành công và có thể dùng ở nhiều nơi khác nhau
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Call connectDB first!')
  return trelloDatabaseInstance
}

export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}
