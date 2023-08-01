import { Router } from 'express'
import {
  loginSchemaValidator,
  loginDatabaseValidator,
  registerSchemaValidator,
  registerDatabaseValidator,
  accessTokenValidator,
  refreshTokenValidator
} from '~/middlewares/users.middlewares'
import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import { wrapRequestHandler } from '~/utils/handlers'
import { USERS_MESSAGES } from '~/constants/messages'

const usersRouter = Router()
/**
 * Description: Login a user
 * Path: /login
 * Method: POST
 * Body: { email: string, password: string }
 */
usersRouter.post('/login', loginSchemaValidator, loginDatabaseValidator, wrapRequestHandler(loginController))

/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISOString }
 */
usersRouter.post(
  '/register',
  registerSchemaValidator,
  registerDatabaseValidator,
  wrapRequestHandler(registerController)
)

/**
 * Description: Logout a user
 * Path: /logout
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

export default usersRouter
