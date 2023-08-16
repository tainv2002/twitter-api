import { Router } from 'express'
import {
  serveImageController,
  serveVideoStreamController,
  serveVideoM3u8Controller,
  serveSegmentController
} from '~/controllers/medias.controllers'

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

/**
 * Description: Get a video HLS
 * Path: /video-hls/:id
 * Method: GET
 */
staticRouter.get('/video-hls/:id/master.m3u8', serveVideoM3u8Controller)

/**
 * Description: Get a video HLS
 * Path: /video-hls/:id
 * Method: GET
 */
staticRouter.get('/video-hls/:id/:v/:segment', serveSegmentController)

export default staticRouter
