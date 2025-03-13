/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import 'dotenv/config'

export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,
  LOCAL_DEV_APP_PORT: process.env.LOCAL_DEV_APP_PORT,
  LOCAL_DEV_APP_HOST: process.env.LOCAL_DEV_APP_HOST,

  BUILD_MODE: process.env.BUILD_MODE,

  AUTHOR: process.env.AUTHOR,
  WEBSITE_DOMAIN_DEVELOPMENT: process.env.WEBSITE_DOMAIN_DEVELOPMENT,
  WEBSITE_DOMAIN_PRODUCTION: process.env.WEBSITE_DOMAIN_PRODUCTION,

  // BREVO_API_KEY: process.env.BREVO_API_KEY,
  ADMIN_EMAIL_ADDRESS: process.env.ADMIN_EMAIL_ADDRESS,
  ADMIN_EMAIL_NAME: process.env.ADMIN_EMAIL_NAME,
  ADMIN_EMAIL_APP_PASSWORD: process.env.ADMIN_EMAIL_APP_PASSWORD,

  ACCESS_TOKEN_SECRET_SIGNATURE: process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
  ACCESS_TOKEN_LIFE: process.env.ACCESS_TOKEN_LIFE,

  REFRESH_TOKEN_SECRET_SIGNATURE: process.env.REFRESH_TOKEN_SECRET_SIGNATURE,
  REFRESH_TOKEN_LIFE: process.env.REFRESH_TOKEN_LIFE,

  //Cluodinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}
