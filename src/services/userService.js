import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'

import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'

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
    // const resultEmail = await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    
    return pickUser(getNewUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew
}
