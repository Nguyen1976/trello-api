import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'

import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { JWTProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'

const createNew = async (reqBody) => {
  try {
    //Kiểm tra xem email đã tồn tại trong hệ thống của chúng ta hay chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }
    //Tạo data để lưu vào database

    const nameFromEmail = reqBody.email.split('@')[0]

    const newUser = {
      email: reqBody.email,
      password: bcrypt.hashSync(reqBody.password, 8),
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    const createdUser = await userModel.createNew(newUser)

    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    //Gửi email cho người dùng xác thực tài khoản
    const verifycationLink = `${WEBSITE_DOMAIN}/account/verifycation?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject =
      'Trello web MERN Stack: Please verify your email before using our services!'
    const htmlContent = `
        <h3>Here is your verifycation link: </h3>
        <h3>${verifycationLink}</h3>
        <h3>Sincerely, <br/> - Nguyen - </h3>
    `

    //Gọi tới provider gửi mail đang có bug
    const resultEmail = await BrevoProvider.sendEmail(
      getNewUser.email,
      customSubject,
      htmlContent
    )
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    //Query user trong db
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')

    if (existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your Account is already active!'
      )

    if (reqBody.token !== existUser.verifyToken)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')

    //Nếu như mọi thứ OK thì verify account
    const updateData = {
      isActive: true,
      verifyToken: null
    }

    const updatedUser = userModel.update(existUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)

    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')

    if (!existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Your Account isn't already active!"
      )
    if (!bcrypt.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your Email or Password is incorrect!'
      )
    }

    //Nếu mọi thứ ok thì bắt đầu tạo tokens đăng nhập trả về phía FE
    //Thông tin đính kèm trong token là _id và email của user
    const userInfo = {
      _id: existUser._id,
      email: existUser.email
    }

    //Tạo ra 2 loại token, accessToken và resfreshToken
    const accessToken = await JWTProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5 //5s
    )

    const refreshToken = await JWTProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
      // 15
    )

    return {
      accessToken,
      refreshToken,
      ...pickUser(existUser)
    }
    //Trả về thông tin cho user kèm theo token
  } catch (error) {
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    const refreshTokenDecoded = await JWTProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )

    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    const accessToken = await JWTProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    )

    return { accessToken }
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken
}
