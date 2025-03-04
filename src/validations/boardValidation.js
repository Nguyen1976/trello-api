/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required!',
      'string.empty': "Title can't be empty!!",
      'string.max': 'Title max 3 chars',
      'string.min': 'Title min 3 chars',
      'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict()
  })

  try {
    console.log(req.body)

    await correctCondition.validateAsync(req.body, {
      abortEarly: false //abortEarly là dừng lại ngay khi gặp lỗi đầu tiên phải set về false để nó log hết lỗi ra
    })

    // next()

    res
      .status(StatusCodes.CREATED)
      .json({ message: 'POST from Validation: API create new board' })
  } catch (error) {
    console.log(error)
    //UNPROCESSABLE_ENTITY: 422 - Thực thể dữ liệu không thể thực thi tức là dữ liệu truyền vào k đúng định dạng
    res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .json({ errors: new Error(error).message })
  }
}

export const boardValidation = {
  createNew
}
