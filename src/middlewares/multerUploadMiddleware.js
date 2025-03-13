import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import nulter from 'multer'
import ApiError from '~/utils/ApiError'
import {
  ALLOW_COMMON_FILE_TYPES,
  LIMIT_COMMON_FILE_SIZE
} from '~/utils/validators'

//https://www.npmjs.com/package/multer
//docs có hỗ trợ tiếng việt

//Funtion kiểm tra loại file nào được chấp nhận
const customFileFilter = (req, file, callback) => {
console.log("🚀 ~ multerUploadMiddleware.js:15 ~ file:", file)

  //Đói với multer kiểm tra kiểu file thì sử dụng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errorMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage),
      null
    )
  }

  return callback(null, true)
}

//Khởi tạo func upload được bọc bởi thằng multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerUploadMiddleware = {
  upload
}
