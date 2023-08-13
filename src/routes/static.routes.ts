import { Router } from 'express'
import { serveImageController, serveVideoController } from '~/controllers/medias.controllers'

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
staticRouter.get('/video/:name', serveVideoController)

export default staticRouter
