import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import { CONVERSATIONS_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validations'

export const getConversationsByReceiverIdValidator = validate(
  checkSchema(
    {
      receiver_id: {
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGE.INVALID_RECEIVER_ID,
                status: HTTP_STATUS_CODE.BAD_REQUEST
              })
            }

            const receiver = await databaseService.users.findOne(
              { _id: new ObjectId(value) },
              {
                projection: {
                  password: 0,
                  email_verify_token: 0,
                  forgot_password_token: 0
                }
              }
            )
            if (!receiver) {
              throw new ErrorWithStatus({
                message: CONVERSATIONS_MESSAGE.RECEIVER_NOT_FOUND,
                status: HTTP_STATUS_CODE.NOT_FOUND
              })
            }

            return true
          }
        }
      }
    },
    ['params']
  )
)
