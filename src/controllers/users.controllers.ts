import { Request, Response } from 'express'
import { WithId } from 'mongodb'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import { USERS_MESSAGES } from '~/constants/messages'
import { LogoutRequestBody, RegisterRequestBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/users.services'

export const loginController = async (req: Request, res: Response) => {
  const { user } = req
  const user_id = (user as WithId<User>)._id

  const data = await usersService.login(user_id.toString())

  res.status(HTTP_STATUS_CODE.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESSFULLY,
    data
  })
}

export const registerController = async (req: Request<object, object, RegisterRequestBody>, res: Response) => {
  const data = await usersService.register(req.body)

  res.status(HTTP_STATUS_CODE.OK).json({
    message: USERS_MESSAGES.REGISTER_SUCCESSFULLY,
    data
  })
}

export const logoutController = async (req: Request<object, object, LogoutRequestBody>, res: Response) => {
  const { refresh_token } = req.body

  await usersService.logout(refresh_token)

  res.status(HTTP_STATUS_CODE.OK).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESSFULLY
  })
}
