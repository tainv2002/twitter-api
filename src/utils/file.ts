import { Request, Response } from 'express'
import formidable, { Files } from 'formidable'
import fs from 'fs'
import path from 'path'

export const initFolders = () => {
  const uploadsFolderPath = path.resolve('uploads/images')
  if (!fs.existsSync(uploadsFolderPath)) {
    fs.mkdirSync(uploadsFolderPath, {
      recursive: true // Tạo folder nested
    })
  }
}

export const handleUploadSingleImage = (req: Request, res: Response) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    maxFileSize: 800 * 1024, // 800KB
    keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      console.log({ name, originalFilename, mimetype })

      // return Boolean(mimetype && mimetype.includes('image'))
      const valid = name === 'image' && Boolean(mimetype?.includes('image'))

      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }

      return valid
    }
  })

  return new Promise<Files>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      console.log({ fields, files })

      if (err) {
        return reject(err)
      }

      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('File is empty'))
      }

      return resolve(files)
    })
  })
}
