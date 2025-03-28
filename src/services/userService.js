import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'

import { WEBSITE_DOMAIN } from '~/utils/constants'
import { EmailProvider } from '~/providers/SendEmailProvider'
import { env } from '~/config/environment'
import { JWTProvider } from '~/providers/JwtProvider'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

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
    const verifycationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject =
      'Trello web MERN Stack: Please verify your email before using our services!'
    const htmlContent = `
        <h3>Here is your verifycation link: </h3>
        <h3>${verifycationLink}</h3>
        <h3>Sincerely, <br/> - Nguyen - </h3>
    `

    //Gọi tới provider gửi mail đang có bug
    EmailProvider.sendEmail(getNewUser.email, customSubject, htmlContent)
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

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    //Query user và kiểm tra cho chắc chắn
    const existUser = await userModel.findOneById(userId)
    if (!existUser)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if (!existUser.isActive)
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        'Your account is not active'
      )

    let updatedUser = {}

    //Trường hợp change password
    if (reqBody.current_password && reqBody.new_password) {
      //Kiểm tra currentPassword có đúng không

      if (!bcrypt.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(
          StatusCodes.NOT_ACCEPTABLE,
          'Your current password is incorrect'
        )
      }
      //Nếu như current_password đúng  thì hash 1 mật khẩu mới
      updatedUser = await userModel.update(userId, {
        password: bcrypt.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvatarFile) {
      //Trường hợp upload file lên cloudStorage (cloudinary)
      const uploadResult = await CloudinaryProvider.streamUpload(
        userAvatarFile.buffer,
        'users-trello-web'
      )

      //Lưu url file ảnh vào db (secure_url)
      updatedUser = await userModel.update(userId, {
        avatar: uploadResult.secure_url
      })
    } else {
      //Trường hợp update các thông tin chung như displayName
      updatedUser = await userModel.update(userId, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}
