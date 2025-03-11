//https://github.com/getbrevo/brevo-node

const SibApiV3Sdk = require('@getbrevo/brevo')

import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

let apiKey = apiInstance.authentications['apiKey']

apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  //Khởi tạo một cái sendSmtpEmail với những thông tin cần thiết
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

  //Tài khoản gửi mail phải là Email tạo tài khoản brevo
  sendSmtpEmail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME
  }

  //Những tài khoản nhận email
  //'to' là 1 array để có thể tùy biến gửi 1 email tới nhiều user
  sendSmtpEmail.to = [{ email: recipientEmail }]

  //Tiều đề email
  sendSmtpEmail.subject = customSubject

  //Content
  sendSmtpEmail.htmlContent = htmlContent

  //Gọi hành động gửi mail
  return apiInstance.sendTransacEmail(sendSmtpEmail) //return về 1 promise
}

export const BrevoProvider = {
  sendEmail
}
