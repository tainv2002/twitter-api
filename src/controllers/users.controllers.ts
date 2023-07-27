import { Request, Response } from 'express'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  res.json({
    message: 'Login success'
  })
}

export const registerController = async (req: Request<object, object, RegisterRequestBody>, res: Response) => {
  try {
    const data = await usersService.register(req.body)

    res.status(200).json({
      message: 'Register success',
      data
    })
  } catch (error) {
    console.log(error)

    res.status(400).json({
      message: 'Register failed',
      error
    })
  }
}
