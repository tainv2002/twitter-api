import { Request } from 'express'
import { getBaseName, getExtensionName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Others'
config()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result = await Promise.all<Media>(
      files.map(async (file) => {
        const newName = getBaseName(file.newFilename) + '.jpg'
        const newPath = path.join(UPLOAD_IMAGE_DIR, newName)
        await sharp(file.filepath).jpeg().toFile(newPath)
        fs.unlinkSync(file.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${newName}`
            : `http://localhost:${process.env.PORT}/static/image/${newName}`,
          type: MediaType.Image
        }
      })
    )

    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result = files.map((file) => ({
      url: isProduction
        ? `${process.env.HOST}/static/video/${file.newFilename}`
        : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
      type: MediaType.Video
    }))
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
