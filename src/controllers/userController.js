import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'

const createNew = async (req, resizeBy, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    resizeBy.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew
}
