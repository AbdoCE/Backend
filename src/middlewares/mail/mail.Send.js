
//import nodemailer from 'nodemailer'
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library'); 
//cấu hình email
const GOOGLE_MAILER_CLIENT_ID = process.env.GOOGLE_MAILER_CLIENT_ID
const GOOGLE_MAILER_CLIENT_SECRET = process.env.GOOGLE_MAILER_CLIENT_SECRET
const GOOGLE_MAILER_REFRESH_TOKEN = process.env.GOOGLE_MAILER_REFRESH_TOKEN
const ADMIN_EMAIL_ADDRESS = process.env.ADMIN_EMAIL_ADDRESS
//// Khởi tạo OAuth2Client với Client ID và Client Secret 
const myOAuth2Client = new OAuth2Client(
  GOOGLE_MAILER_CLIENT_ID,
  GOOGLE_MAILER_CLIENT_SECRET
)
// Set Refresh Token vào OAuth2Client Credentials
myOAuth2Client.setCredentials({
  refresh_token: GOOGLE_MAILER_REFRESH_TOKEN
})

const mailSend = async (email,subject,body) => {
  try {
     const myAccessTokenObject = await myOAuth2Client.getAccessToken()
     // Access Token sẽ nằm trong property 'token' trong Object mà chúng ta vừa get được ở trên
     const myAccessToken = myAccessTokenObject?.token
     // Tạo một biến Transport từ Nodemailer với đầy đủ cấu hình, dùng để gọi hành động gửi mail
     const transport = nodemailer.createTransport({
       service: 'gmail',
       auth: {
         type: 'OAuth2',
         user: ADMIN_EMAIL_ADDRESS,
         clientId: GOOGLE_MAILER_CLIENT_ID,
         clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
         refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
         accessToken: myAccessToken
       }
     })
     // mailOption là những thông tin gửi từ phía client lên thông qua API
     const mailOptions = {
       to: email, // Gửi đến ai?
       subject: subject, // Tiêu đề email
       html: body // Nội dung email
     }
     // Gọi hành động gửi email
     await transport.sendMail(mailOptions)
     return true
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  mailSend,
}