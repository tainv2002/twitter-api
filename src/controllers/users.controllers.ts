import { Request, Response } from 'express'
import { ObjectId, WithId } from 'mongodb'
import { envConfig } from '~/constants/config'
import { UserVerifyStatus } from '~/constants/enums'
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
  ResetPasswordRequestBody,
  UpdateMeRequestBody,
  GetProfileRequestParams,
  FollowRequestBody,
  UnfollowRequestParams,
  ChangePasswordRequestBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = async (req: Request<object, object, LoginRequestBody>, res: Response) => {
  const { user } = req
  const { _id: user_id, verify } = user as WithId<User>

  const result = await usersService.login({ user_id: user_id.toString(), verify })

  return res.json(result)
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query

  const { data } = await usersService.oauth(code as string)

  const urlRedirect = `${envConfig.clientRedirectCallback}?access_token=${data.access_token}&refresh_token=${data.refresh_token}&new_user=${data.new_user}&verify=${data.verify}`

  return res.redirect(urlRedirect)
}

export const registerController = async (req: Request<object, object, RegisterRequestBody>, res: Response) => {
  const result = await usersService.register(req.body)

  return res.json(result)
}

export const logoutController = async (req: Request<object, object, LogoutRequestBody>, res: Response) => {
  const { refresh_token } = req.body

  const result = await usersService.logout(refresh_token)

  return res.json(result)
}

export const refreshTokenController = async (req: Request<object, object, RefreshTokenRequestBody>, res: Response) => {
  const { refresh_token } = req.body
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload

  const result = await usersService.refreshToken({ refresh_token, user_id, verify, exp })

  return res.json(result)
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

  const result = await usersService.verifyEmail(user_id)

  return res.json(result)
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

  const result = await usersService.resendVerifyEmail(user_id, user.email)

  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<object, object, ForgotPasswordRequestBody>,
  res: Response
) => {
  const { _id: user_id, verify, email } = req.user as WithId<User>

  const result = await usersService.forgotPassword({ user_id: user_id.toString(), verify, email })

  return res.json(result)
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

  const result = await usersService.resetPassword({ user_id, password })

  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await usersService.getMe(user_id)

  return res.json(result)
}

export const updateMeController = async (req: Request<object, object, UpdateMeRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await usersService.updateMe({ payload: req.body, user_id })

  return res.json(result)
}

export const getProfileController = async (req: Request<GetProfileRequestParams>, res: Response) => {
  const { username } = req.params

  const result = await usersService.getProfile(username)

  return res.json(result)
}

export const followController = async (req: Request<object, object, FollowRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body

  const result = await usersService.follow({ user_id, followed_user_id })

  return res.json(result)
}

export const unfollowController = async (req: Request<UnfollowRequestParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params

  const result = await usersService.unfollow({ user_id, followed_user_id })

  return res.json(result)
}

export const changePasswordController = async (
  req: Request<object, object, ChangePasswordRequestBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword({ user_id, password })

  return res.json(result)
}
