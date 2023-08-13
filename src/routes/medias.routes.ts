import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

/**
 * Description: Upload images
 * Path: /upload-image
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { image: Files }
 */
mediasRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadImageController)
)

/**
 * Description: Upload videos
 * Path: /upload-video
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { video: Files }
 */
mediasRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoController)
)

export default mediasRouter
