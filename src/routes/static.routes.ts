import { Router } from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/medias.controllers'

const staticRouter = Router()

/**
 * Description: Get an image
 * Path: /image/:name
 * Method: GET
 */
staticRouter.get('/image/:name', serveImageController)

/**
 * Description: Get a video
 * Path: /video/:name
 * Method: GET
 */
staticRouter.get('/video-stream/:name', serveVideoStreamController)

export default staticRouter
