import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import omit from 'lodash/omit'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (err instanceof ErrorWithStatus) {
      return res.status(err.status).json(omit(err, ['status']))
    }

    const finalError: any = {}
    Object.getOwnPropertyNames(err).forEach((key) => {
      const propertyDescriptor = Object.getOwnPropertyDescriptor(err, key)
      if (!propertyDescriptor?.configurable || !propertyDescriptor.writable) return
      finalError[key] = err[key]
    })

    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: finalError.message,
      errorInfo: omit(finalError, ['stack'])
    })
  } catch (error: any) {
    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      message: 'Internal Server Error',
      errorInfo: omit(error, ['stack'])
    })
  }
}
