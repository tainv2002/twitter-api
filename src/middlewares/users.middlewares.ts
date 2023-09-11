import { NextFunction, Request, Response } from 'express'
import { ParamSchema, Schema, checkSchema } from 'express-validator'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import { USERS_MESSAGES } from '~/constants/messages'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
import { LoginRequestBody, RegisterRequestBody, TokenPayload } from '~/models/requests/User.requests'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validations'
import { JsonWebTokenError, Secret } from 'jsonwebtoken'
import capitalize from 'lodash/capitalize'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { REGEX_USERNAME } from '~/constants/regex'
import { verifyAccessToken } from '~/utils/common'
import { envConfig } from '~/constants/config'

const schemaValidator: Record<string, ParamSchema> = {
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
  forgot_password_token: {
    trim: true,
    custom: {
      options: async (value, { req }) => {
        if (!value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
            status: HTTP_STATUS_CODE.UNAUTHORIZED
          })
        }

        try {
          const decoded_forgot_password_token = await verifyToken({
            token: value,
            secretOrPublicKey: envConfig.jwtSecretForgotPasswordToken as Secret
          })

          const user = await databaseService.users.findOne({
            _id: new ObjectId(decoded_forgot_password_token.user_id)
          })

          if (!user) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS_CODE.UNAUTHORIZED
            })
          }

          if (user.forgot_password_token !== value) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
              status: HTTP_STATUS_CODE.UNAUTHORIZED
            })
          }

          ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
        } catch (error) {
          if (error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: capitalize(error.message),
              status: HTTP_STATUS_CODE.UNAUTHORIZED
            })
          }
          throw error
        }
      }
    }
  },
  name: {
    optional: true,
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
  date_of_birth: {
    isISO8601: {
      options: {
        strict: true,
        strictSeparator: true
      },
      errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601,
      bail: true
    }
  },
  image: {
    optional: true,
    isString: {
      bail: true,
      errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
    },
    trim: true,
    isLength: {
      options: {
        max: 200,
        min: 1
      },
      bail: true,
      errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_200
    }
  },
  user_id: {
    custom: {
      options: async (value: string) => {
        if (!ObjectId.isValid(value)) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.INVALID_USER_ID,
            status: HTTP_STATUS_CODE.NOT_FOUND
          })
        }

        const user = await databaseService.users.findOne({ _id: new ObjectId(value) })
        if (!user) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS_CODE.NOT_FOUND
          })
        }
      }
    }
  }
}

export const loginSchemaValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          bail: true,
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true
      },
      password: schemaValidator['password']
    },
    ['body']
  )
)

export const loginExistedUserValidator = async (
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
            msg: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT
          }
        }
      })
    )
  }

  req.user = user
  next()
}

export const registerSchemaValidator = validate(
  checkSchema(
    {
      name: schemaValidator['name'],
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
      },
      password: schemaValidator['password'],
      confirm_password: schemaValidator['confirm_password'],
      date_of_birth: schemaValidator['date_of_birth']
    },
    ['body']
  )
)

export const registerExistedUserValidator = async (
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

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]

            return await verifyAccessToken(access_token, req as Request)
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            try {
              if (!value) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                  status: HTTP_STATUS_CODE.UNAUTHORIZED
                })
              }

              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: envConfig.jwtSecretRefreshToken as Secret }),
                databaseService.refreshTokens.findOne({ token: value })
              ])

              if (refresh_token == null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.REFRESH_TOKEN_HAS_BEEN_USED_OR_DOES_NOT_EXIST,
                  status: HTTP_STATUS_CODE.UNAUTHORIZED
                })
              }

              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
                  status: HTTP_STATUS_CODE.UNAUTHORIZED
                })
              } else {
                throw error
              }
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyEmailTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS_CODE.UNAUTHORIZED
              })
            }

            try {
              const decoded_verify_email_token = await verifyToken({
                token: value,
                secretOrPublicKey: envConfig.jwtSecretEmailVerifyToken as Secret
              })

              ;(req as Request).decoded_verify_email_token = decoded_verify_email_token

              return true
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS_CODE.UNAUTHORIZED
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          bail: true,
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        isEmail: {
          bail: true,
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        custom: {
          options: async (value: string, { req }) => {
            const user = await databaseService.users.findOne({ email: value })

            if (!user) {
              throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
            }

            ;(req as Request).user = user
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: schemaValidator['forgot_password_token']
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: schemaValidator['password'],
      confirm_password: schemaValidator['confirm_password'],
      forgot_password_token: schemaValidator['forgot_password_token']
    },
    ['body']
  )
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload

  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS_CODE.FORBIDDEN
      })
    )
  }

  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...schemaValidator['name'],
        optional: true
      },
      date_of_birth: {
        ...schemaValidator['date_of_birth'],
        optional: true
      },
      bio: {
        optional: true,
        isString: {
          bail: true,
          errorMessage: USERS_MESSAGES.BIO_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            max: 200,
            min: 1
          },
          bail: true,
          errorMessage: USERS_MESSAGES.BIO_LENGTH_MUST_BE_FROM_1_TO_200
        }
      },
      location: {
        optional: true,
        isString: {
          bail: true,
          errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            max: 200,
            min: 1
          },
          bail: true,
          errorMessage: USERS_MESSAGES.LOCATION_LENGTH_MUST_BE_FROM_1_TO_200
        }
      },
      website: {
        optional: true,
        isString: {
          bail: true,
          errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            max: 200,
            min: 1
          },
          bail: true,
          errorMessage: USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_FROM_1_TO_200
        }
      },
      username: {
        optional: true,
        isString: {
          bail: true,
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_A_STRING
        },
        trim: true,
        isLength: {
          options: {
            max: 50,
            min: 1
          },
          bail: true,
          errorMessage: USERS_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_1_TO_50
        },
        custom: {
          options: async (value: string) => {
            if (!REGEX_USERNAME.test(value)) {
              throw new Error(USERS_MESSAGES.USERNAME_IS_INVALID)
            }

            const user = await databaseService.users.findOne({ username: value })

            if (user) {
              throw new Error(USERS_MESSAGES.USERNAME_ALREADY_EXISTED)
            }
          }
        }
      },
      avatar: schemaValidator['image'],
      cover_photo: schemaValidator['image']
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: schemaValidator['user_id']
    },
    ['body']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      user_id: schemaValidator['user_id']
    },
    ['params']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...schemaValidator['password'],
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decoded_authorization as TokenPayload
            const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

            if (!user) {
              throw new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_FOUND, status: HTTP_STATUS_CODE.NOT_FOUND })
            }

            const hashedPassword = hashPassword(value)

            if (user.password !== hashedPassword) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.OLD_PASSWORD_NOT_MATCH,
                status: HTTP_STATUS_CODE.UNAUTHORIZED
              })
            }
          }
        }
      },
      password: schemaValidator['password'],
      confirm_password: schemaValidator['confirm_password']
    },
    ['body']
  )
)

export const isUserLoggedInValidator =
  (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }

    next()
  }

export const getConversationsByReceiverIdValidator = validate(
  checkSchema(
    {
      receiver_id: schemaValidator['user_id']
    },
    ['params']
  )
)
