import { NextFunction, Request, RequestHandler, Response } from 'express'

export const wrapRequestHandler = <P, Q>(func: RequestHandler<P, any, any, Q>) => {
  return async (req: Request<P, any, any, Q>, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
