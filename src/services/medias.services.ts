import { Request } from 'express'
import { getBaseName, handleUploadSingleImage } from '~/utils/file'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { UPLOAD_DIR } from '~/constants/dir'

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadSingleImage(req)
    const newName = getBaseName(file.newFilename) + '.jpg'
    const newPath = path.join(UPLOAD_DIR, newName)
    await sharp(file.filepath).jpeg().toFile(newPath)
    fs.unlinkSync(file.filepath)
    return `http://localhost:4000/uploads/${newName}`
  }
}

const mediasService = new MediasService()
export default mediasService
