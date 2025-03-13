//https://github.com/getbrevo/brevo-node

import { env } from '~/config/environment'

//Không sử dụng brevo cho việc gửi email tự động vì nó k cho phép gửi email từ nhưng email free như @gmail hay @yahho thay vào đó dùng nodemailer
// const SibApiV3Sdk = require('@getbrevo/brevo')
// let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
// let apiKey = apiInstance.authentications['apiKey']
// apiKey.apiKey = env.BREVO_API_KEY
// const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
//   //Khởi tạo một cái sendSmtpEmail với những thông tin cần thiết
//   let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

//   //Tài khoản gửi mail phải là Email tạo tài khoản brevo
//   sendSmtpEmail.sender = {
//     email: env.ADMIN_EMAIL_ADDRESS,
//     name: env.ADMIN_EMAIL_NAME
//   }

//   //Những tài khoản nhận email
//   //'to' là 1 array để có thể tùy biến gửi 1 email tới nhiều user
//   sendSmtpEmail.to = [{ email: recipientEmail }]

//   //Tiều đề email
//   sendSmtpEmail.subject = customSubject

//   //Content
//   sendSmtpEmail.htmlContent = htmlContent

//   //Gọi hành động gửi mail
//   return apiInstance.sendTransacEmail(sendSmtpEmail) //return về 1 promise
// }

const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: env.ADMIN_EMAIL_ADDRESS,
    pass: 'hfjx uuoh nvfm dgko' //https://myaccount.google.com/apppasswords truy cập để lấy app Password
  }
})

const sendEmail = (recipientEmail, customSubject, htmlContent) => {
  transporter.sendMail({
    from: `"Trello web 📋" <${env.ADMIN_EMAIL_ADDRESS}>`, // sender address
    to: `${recipientEmail}`, // list of receivers
    subject: customSubject, // Subject line
    // text: 'Hello world?', // plain text body
    html: htmlContent // html body
  })
}

export const EmailProvider = {
  sendEmail
}
