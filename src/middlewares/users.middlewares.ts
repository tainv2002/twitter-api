import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { USERS_MESSAGES } from '~/constants/messages'
import { EntityError } from '~/models/Errors'
import { LoginRequestBody, RegisterRequestBody } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { validate } from '~/utils/validations'

export const loginSchemaValidator = validate(
  checkSchema({
    email: {
      isEmail: {
        bail: true,
        errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
      },
      trim: true
      // custom: {
      //   options: async (value, { req }) => {
      //     const hashedPassword = hashPassword(req.body.password)
      //     const user = await databaseService.users.findOne({ email: value, password: hashedPassword })

      //     if (!user) {
      //       throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
      //     }

      //     req.user = user
      //     return true
      //   }
      // }
    },
    password: {
      isString: {
        bail: true,
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          max: 50,
          min: 6
        },
        bail: true,
        errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        bail: true,
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
      }
    }
  })
)

export const loginValidator = async (
  req: Request<object, object, LoginRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body
  const hashedPassword = hashPassword(password)
  const user = await databaseService.users.findOne({ email, password: hashedPassword })

  if (!user) {
    return next(
      new EntityError({
        errors: {
          email: {
            msg: USERS_MESSAGES.USER_NOT_FOUND
          }
        }
      })
    )
  }

  req.user = user
  next()
}

export const registerSchemaValidator = validate(
  checkSchema({
    name: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED,
        bail: true
      },
      isString: {
        bail: true,
        errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          max: 100,
          min: 1
        },
        bail: true,
        errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
      },
      trim: true
    },
    email: {
      notEmpty: {
        bail: true,
        errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        bail: true,
        errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
      },
      trim: true
      // custom: {
      //   options: async (value) => {
      //     const isExistEmail = await usersService.checkEmailExist(value)

      //     if (isExistEmail) {
      //       throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
      //     }
      //     return isExistEmail
      //   }
      // }
    },
    password: {
      notEmpty: {
        bail: true,
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
      },
      isString: {
        bail: true,
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          max: 50,
          min: 6
        },
        bail: true,
        errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        bail: true,
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
      }
    },
    confirm_password: {
      notEmpty: {
        bail: true,
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
      },
      isString: {
        bail: true,
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          max: 50,
          min: 6
        },
        bail: true,
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG,
        bail: true
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_A_PASSWORD)
          }
          return true
        }
      }
    },
    date_of_birth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        },
        errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601,
        bail: true
      }
    }
  })
)

export const registerValidator = async (
  req: Request<object, object, RegisterRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body

  const isExistEmail = await usersService.checkEmailExist(email)

  if (isExistEmail) {
    return next(
      new EntityError({
        errors: {
          email: {
            msg: USERS_MESSAGES.EMAIL_ALREADY_EXISTS
          }
        }
      })
    )
  }
  next()
}
