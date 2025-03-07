/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required!',
      'string.empty': "Title can't be empty!!",
      'string.max': 'Title max 3 chars',
      'string.min': 'Title min 3 chars',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false //abortEarly là dừng lại ngay khi gặp lỗi đầu tiên phải set về false để nó log hết lỗi ra
    })
    next()
  } catch (error) {
    // const errorMessage = new Error(error).message //Vì lỗi trả về từ thư viện Joi lên phải bọc trong new Error
    // const customError = new ApiError(
    //   StatusCodes.UNPROCESSABLE_ENTITY,
    //   errorMessage
    // )
    //UNPROCESSABLE_ENTITY: 422 - Thực thể dữ liệu không thể thực thi tức là dữ liệu truyền vào k đúng định dạng
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE)
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false, 
      allowUnknown: true//Đối vói trường hợp update để k cần đẩy 1 số field lên
    })
    next()
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    )
  }
}

export const boardValidation = {
  createNew,
  update
}
