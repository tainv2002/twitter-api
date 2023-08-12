import { Request } from 'express'
import { getBaseName, handleUploadImage } from '~/utils/file'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { UPLOAD_DIR } from '~/constants/dir'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { MediaType } from '~/constants/enum'
import { Media } from '~/models/Others'
config()

class MediasService {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result = await Promise.all<Media>(
      files.map(async (file) => {
        const newName = getBaseName(file.newFilename) + '.jpg'
        const newPath = path.join(UPLOAD_DIR, newName)
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
}

const mediasService = new MediasService()
export default mediasService
