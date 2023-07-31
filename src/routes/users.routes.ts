import { Router } from 'express'
import {
  loginSchemaValidator,
  loginValidator,
  registerSchemaValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { loginController, registerController } from '~/controllers/users.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/login', loginSchemaValidator, loginValidator, wrapRequestHandler(loginController))
/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISOString }
 */
usersRouter.post('/register', registerSchemaValidator, registerValidator, wrapRequestHandler(registerController))

// usersRouter.get(
//   '/test',
//   query('person').notEmpty().escape().withMessage('Person query không được để trống'),
//   (req, res) => {
//     const errors = validationResult(req)
//     // const person = (req.query as any).person

//     if (errors.isEmpty()) {
//       const data = matchedData(req)
//       return res.send(`Hello, ${data.person}!`)
//     }

//     res.send({ errors: errors.array() })
//   }
// )

export default usersRouter
