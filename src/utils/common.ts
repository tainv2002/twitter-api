import { Request } from 'express'
import { ObjectId } from 'mongodb'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from './jwt'
import { JsonWebTokenError, Secret } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { envConfig } from '~/constants/config'

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const stringEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'string') as string[]
}

export const stringArrayToObjectIdArray = (stringArray: string[]) => {
  return stringArray.map((item) => new ObjectId(item))
}

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: HTTP_STATUS_CODE.UNAUTHORIZED
    })
  }

  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: envConfig.jwtSecretAccessToken as Secret
    })

    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
      return true
    }

    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: HTTP_STATUS_CODE.UNAUTHORIZED
    })
  }
}
