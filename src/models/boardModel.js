import Joi from 'joi'
import { ObjectId, ReturnDocument } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { resolveSoa } from 'dns'
import { isEmpty } from 'lodash'
import { pagingSkipValue } from '~/utils/algorithms'

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

  //Những admin của board
  ownerIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  //Những thành viên của board
  memberIds: Joi.array()
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

export const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)],
    }
    const createdBoard = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .insertOne(newBoardToAdd)
    return createdBoard
  } catch (error) {
    throw new Error(error)
  }
}

export const findOneById = async (boardId) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(boardId)
      })

    return result
  } catch (error) {
    throw new Error(error)
  }
}

//Query tổng hợp (aggreate) để lấy toàn bộ Columns và Cards thuộc về Board (Tức là chúng ta đang phải joi các bảng lại với nhau để lấy dữ liệu)
export const getDetails = async (userId, boardId) => {
  try {
    const queryConditions = [
      { _id: new ObjectId(boardId) },
      {
        _destroy: false
      },
      {
        $or: [
          {
            ownerIds: { $all: [new ObjectId(userId)] }
          },
          {
            memberIds: { $all: [new ObjectId(userId)] }
          }
        ]
      }
    ]

    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            $and: queryConditions
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

//Lấy 1 phần tử columnId ra khỏi mảng columnOrderIds
//Dùng toán tử pull
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(column.boardId)
        },
        {
          $pull: {
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

    if (!isEmpty(updateData.columnOrderIds)) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(
        (c) => new ObjectId(c)
      )
    }

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
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      //Điều kiện 01: Board chưa bị xóa
      {
        _destroy: false
      },
      //Điều kiện 02: Ông user thực hiện req thì nó phải thuộc 1 trong 2 cái mảng ownerIds hoặc memberIds sử dụng toán tử $all của mongodb
      {
        $or: [
          {
            ownerIds: { $all: [new ObjectId(userId)] }
          },
          {
            memberIds: { $all: [new ObjectId(userId)] }
          }
        ]
      }
    ]

    const query = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate(
        [
          { $match: { $and: [...queryConditions] } },
          { $sort: { title: 1 } }, //sort title từ a-z
          //Để xử lý nhiều luồng trong 1 query
          {
            $facet: {
              //Luồng 01: Query boards
              // prettier-ignore
              'queryBoards': [
              { $skip: pagingSkipValue(page, itemsPerPage) }, //Bỏ qua số lượng bản ghi của nhưng page trước đó
              { $limit: itemsPerPage } //Giới hạn tối đa số lượng bản ghi trả về trên 1 page
              ],
              //Luồng 02: Quey đếm tổng số lượng bản ghi board trong db rồi trả về vào biến countedAllBoards
              // prettier-ignore
              'queryTotalBoards': [
              {
                $count: 'countedAllBoards'
              }]
            }
          }
        ],
        //Khi sort thì mặc định chữ B hoa sẽ đứng trước chữ hoa thường  thì dòng này để fix nó
        { collation: { locale: 'en' } }
      )
      .toArray()

    const res = query[0]

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
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
  update,
  pullColumnOrderIds,
  getBoards
}
