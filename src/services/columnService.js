/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }

    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      //Xử lý cấu trúc data ở đây trước khi trả về dữ liệu vì khi t mới column thì chắc chắn column chưa có card lên tạo sẵn một mảng rỗng
      getNewColumn.cards = []

      //Cập nhật mảng columnOrderIds trong collection boards

      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    //...

    return getNewColumn
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew
}
