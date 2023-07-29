import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import { USERS_MESSAGES } from '~/constants/messages'

export type ErrorsType = Record<string, { msg: string; [key?: string]: any }> // { [key: string]: string }

export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ errors, message }: { errors: ErrorsType; message?: string }) {
    super({ message: USERS_MESSAGES.VALIDATION_ERROR, status: HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
