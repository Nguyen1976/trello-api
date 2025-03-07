import Joi from 'joi'
import { ObjectId, ReturnDocument } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { resolveSoa } from 'dns'

//https://github.com/trungquandev/trungquandev-public-utilities-algorithms/blob/main/14-trello-mongodb-schemas/boardModel.js

// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

  // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

//Chỉ ra những field mà chúng ta không muốn cho phép cập nhật trong hàm update()
const INVALID_UPDATE_FIELD = ['_id', 'createAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false
  })
}

export const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(validData)
    return createdBoard
  } catch (error) {
    throw new Error(error)
  }
}

export const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

//Query tổng hợp (aggreate) để lấy toàn bộ Columns và Cards thuộc về Board (Tức là chúng ta đang phải joi các bảng lại với nhau để lấy dữ liệu)
export const getDetails = async (id) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
            _destroy: false
          }
        },
        {
          $lookup: {
            from: columnModel.COLUMN_COLLECTION_NAME,
            localField: '_id', //là id của board hiện tại
            foreignField: 'boardId', //giống như 1 khóa ngoại cái id hiện tại của chúng ta sẽ tìm kiếm bên columnModel với trường là boardId
            as: 'columns' //hiểu là những dữ liệu mà chúng ta chạy sang column để lấy về sẽ được as sang tên là columns
          }
        },
        {
          $lookup: {
            from: cardModel.CARD_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'boardId',
            as: 'cards'
          }
        }
      ])
      .toArray()

    //vì id của board là unique nhưng aggregate vẫn sẽ trả về mảng
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

//Nhiệm vụ của func là push 1 giá trị columnId vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(column.boardId)
        },
        {
          $push: {
            columnOrderIds: new ObjectId(column._id)
          }
        },
        {
          returnDocument: 'after' //trường này để giúp chúng ta trả về bản ghi board sau khi đã cập nhật nếu k nó sẽ trả về bản ghi board tước khi được cập nhật
        }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {
  try {
    //Lọc những field không cho phép cập nhật
    Object.keys(updateData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELD.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(boardId)
        },
        {
          $set: updateData
        },
        {
          returnDocument: 'after' //trường này để giúp chúng ta trả về bản ghi board sau khi đã cập nhật nếu k nó sẽ trả về bản ghi board tước khi được cập nhật
        }
      )
    console.log(result)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update
}

// "_id": {
//     "$oid": "67c86eacfdf0798a29ef6cbb"
//   },

//67c868e67a889567f62a968d

//67c86eacfdf0798a29ef6cbb
