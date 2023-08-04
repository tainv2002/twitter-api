import { Router } from 'express'
import {
  loginSchemaValidator,
  loginDatabaseValidator,
  registerSchemaValidator,
  registerDatabaseValidator,
  accessTokenValidator,
  refreshTokenValidator,
  verifyEmailTokenValidator,
  forgotPasswordValidator
} from '~/middlewares/users.middlewares'
import {
  verifyEmailTokenController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  forgotPasswordController
} from '~/controllers/users.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

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

/**
 * Description: Refresh a token
 * Path: /refresh-token
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { refresh_token: string }
 */
usersRouter.post(
  '/refresh-token',
  accessTokenValidator,
  refreshTokenValidator,
  wrapRequestHandler(refreshTokenController)
)

/**
 * Description: Verify email when user client click on the link in email
 * Path: /verify-email
 * Method: POST
 * Body: { email_verify_token: string }
 */
usersRouter.post('/verify-email', verifyEmailTokenValidator, wrapRequestHandler(verifyEmailTokenController))

/**
 * Description: Resend verify email token
 * Path: /resend-verify-email
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: {}
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

/**
 * Description: Send forgot password token when user forgot password
 * Path: /forgot-password
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { email: string }
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

/**
 * Description: Verify email when user client click on the link in email
 * Path: /verify-email
 * Method: POST
 * Body: { email_verify_token: string }
 */
// usersRouter.post('/verify-forgot-password', verifyEmailTokenValidator, wrapRequestHandler(verifyEmailTokenController))

export default usersRouter
