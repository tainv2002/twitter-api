import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const url = await mediasService.handleUploadSingleImage(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESSFULLY,
    data: url
  })
}

export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params
  console.log(name)

  return res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
