import { Request, Response } from 'express'
import { WithId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/users.services'

export const loginController = async (req: Request, res: Response) => {
  const { user } = req
  const user_id = (user as WithId<User>)._id

  const data = await usersService.login(user_id.toString())

  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    data
  })
}

export const registerController = async (req: Request<object, object, RegisterRequestBody>, res: Response) => {
  const data = await usersService.register(req.body)

  res.status(200).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    data
  })
}
