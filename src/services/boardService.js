/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { slugify } from '~/utils/formatters'
const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    //Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database

    //...

    //Làm thêm các xử lý logic khác với các collection khác tùy đặt thù dự án
    // Bắn mail, notify, về cho admin khi có 1 cái board mới được tạo...

    return newBoard
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}
