/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
const createNew = async (userId, reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    //Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createNew(userId, newBoard)
    //Lấy bản ghi board sau khi gọi
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    //Làm thêm các xử lý logic khác với các collection khác tùy đặt thù dự án
    // Bắn mail, notify, về cho admin khi có 1 cái board mới được tạo...

    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async (userId, boardId) => {
  try {
    const board = await boardModel.getDetails(userId, boardId)

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    //begin
    //Xử lý dữ liệu bên be để phù hợp với bên fe vì ban đầu dữ liệu trả về là board chứ mảng card và mảng column, nhưng thứ chúng ta cần là board chứa mảng column và column chứa mảng card(dữ liệu giống như mockData bên fe)
    //https://www.youtube.com/watch?v=EQVWMjKo1PI&list=PLP6tw4Zpj-RJP2-YrhtkWqObMQ-AA4TDy&index=70
    //VD:
    /**
     * board: {
     *  columns: [
     *    {
     *      cards: [{...}, {...}]
     *    },
     *    ...
     *  ]
     * }
     */
    const resBoard = cloneDeep(board)
    resBoard.columns.forEach((column) => {
      // column.cards = resBoard.cards.filter(
      //   (card) => card.columnId.toString() === column._id.toString()
      // )
      column.cards = resBoard.cards.filter((card) =>
        card.columnId.equals(column._id)
      )
    })

    delete resBoard.cards //vì chúng ta k cần mảng cards ở bên trong board nữa vì ta đã sắp xếp đừa card về dùng column mà chúng đứng rồi
    //end
    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa _id của Card ra khỏi mảng) (fillter)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    //   B2: Cập nhật mảng cardOrderIds của Column tiếp theo
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    //   B3: Cập nhật lại trường columnId của card
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })

    return {
      updateResult: 'Successfully!!'
    }
  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE

    const results = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10)
    )

    return results
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}
