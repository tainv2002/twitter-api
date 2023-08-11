import { NextFunction, Request, Response } from 'express'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await handleUploadSingleImage(req, res)

  return res.json({
    data
  })
}
