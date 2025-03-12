import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService'

const createNew = async (req, resizeBy, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    resizeBy.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) {
    next(error)
  }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)

    //Xử lý trả về http only cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true, //Tức là cookie chỉ gửi qua http FE sẽ k động vào được
      secure: true,
      samseSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true, //Tức là cookie chỉ gửi qua http FE sẽ k động vào được
      secure: true,
      samseSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login
}
