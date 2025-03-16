import { StatusCodes } from 'http-status-codes'
import { JWTProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  //Lấy accessToken từ client đẩy lên
  const clientAccessToken = req.cookies?.accessToken

  if (!clientAccessToken) {
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)')
    )
    return
  }

  try {
    //Thực hiện giải mã token xem có hợp lệ hay không
    const accessTokenDecoded = await JWTProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )

    

    //Quan trọng: Nếu như token hợp lệ, thì sẽ cần phải lưu thông tin giải mã được vài cái req.jwtDecoded sử dụng cho cấc tầng cần xử lý
    req.jwtDecoded = accessTokenDecoded
    //Cho phép req đi tiếp

    next()
  } catch (error) {
    // console.log(error)
    //Nếu accesstoken hết hạn thì cần 1 mã lỗi cho phía FE biết để gọi api refreshToken (410)
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
      return
    }
    //Nếu như cái accessToken nó k hợp lệ do bất kì điều j khác vụ hết hạn thì chúng ta cứ thawnfng tay trả về 401 cho BE gọi sign_out luôn
    new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!')
  }
}

export const authMiddleware = {
  isAuthorized
}
