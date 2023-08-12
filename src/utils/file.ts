import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolders = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true // Tạo folder nested
    })
  }
}

export const handleUploadImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR,
    maxFiles: 4,
    maxFileSize: 800 * 1024, // 800KB
    maxTotalFileSize: 800 * 1024 * 4,
    keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      // return Boolean(mimetype && mimetype.includes('image'))
      const valid = name === 'image' && Boolean(mimetype?.includes('image'))

      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }

      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }

      return resolve(files.image)
    })
  })
}

export const getBaseName = (filename: string) => {
  return path.basename(filename, path.extname(filename))
}
