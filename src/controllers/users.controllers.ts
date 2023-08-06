import { Request, Response } from 'express'
import { ObjectId, WithId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import { USERS_MESSAGES } from '~/constants/messages'
import {
  VerifyEmailTokenRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  RefreshTokenRequestBody,
  RegisterRequestBody,
  TokenPayload,
  ForgotPasswordRequestBody,
  VerifyForgotPasswordRequestBody,
  ResetPasswordRequestBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = async (req: Request<object, object, LoginRequestBody>, res: Response) => {
  const { user } = req
  const user_id = (user as WithId<User>)._id

  const data = await usersService.login(user_id.toString())

  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESSFUL,
    data
  })
}

export const registerController = async (req: Request<object, object, RegisterRequestBody>, res: Response) => {
  const data = await usersService.register(req.body)

  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESSFUL,
    data
  })
}

export const logoutController = async (req: Request<object, object, LogoutRequestBody>, res: Response) => {
  const { refresh_token } = req.body

  await usersService.logout(refresh_token)

  res.json({
    message: USERS_MESSAGES.LOGOUT_SUCCESSFUL
  })
}

export const refreshTokenController = async (req: Request<object, object, RefreshTokenRequestBody>, res: Response) => {
  const { refresh_token } = req.body
  const { user_id, exp } = req.decoded_refresh_token as TokenPayload

  const data = await usersService.refreshToken({ refresh_token, user_id, exp: Number(exp) })

  res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESSFUL,
    data
  })
}

export const verifyEmailTokenController = async (
  req: Request<object, object, VerifyEmailTokenRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_verify_email_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  // Đã verify rồi
  if (user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }

  const data = await usersService.verifyEmail(user_id)

  return res.json({
    message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESSFULLY,
    data
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }

  await usersService.resendVerifyEmail(user_id)

  return res.json({
    message: USERS_MESSAGES.RESEND_VERIFICATION_EMAIL_SUCCESSFULLY
  })
}

export const forgotPasswordController = async (
  req: Request<object, object, ForgotPasswordRequestBody>,
  res: Response
) => {
  const user_id = (req.user as WithId<User>)._id

  await usersService.forgotPassword(user_id.toString())

  return res.json({
    message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
  })
}

export const verifyForgotPasswordController = async (
  req: Request<object, object, VerifyForgotPasswordRequestBody>,
  res: Response
) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESSFULLY
  })
}

export const resetPasswordController = async (
  req: Request<object, object, ResetPasswordRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body

  await usersService.resetPassword({ user_id, password })

  return res.json({
    message: USERS_MESSAGES.RESET_PASSWORD_SUCCESSFULLY
  })
}

export const getMeController = async (req: Request<object, object, ResetPasswordRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const data = await usersService.getMe(user_id)

  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESSFULLY,
    data
  })
}
