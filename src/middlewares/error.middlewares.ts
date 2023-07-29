import { NextFunction, Request, Response } from 'express'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import omit from 'lodash/omit'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json(omit(err, ['status']))
}
