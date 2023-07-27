import { Router } from 'express'
import { query, validationResult, matchedData } from 'express-validator'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { loginController, registerController } from '~/controllers/users.controllers'
import { validate } from '~/utils/validations'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)
/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISOString }
 */
usersRouter.post('/register', validate(registerValidator), registerController)

usersRouter.get(
  '/test',
  query('person').notEmpty().escape().withMessage('Person query không được để trống'),
  (req, res) => {
    const errors = validationResult(req)
    // const person = (req.query as any).person

    if (errors.isEmpty()) {
      const data = matchedData(req)
      return res.send(`Hello, ${data.person}!`)
    }

    res.send({ errors: errors.array() })
  }
)

export default usersRouter
