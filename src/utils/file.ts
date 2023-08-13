import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initFolders = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // Tạo folder nested
      })
    }
  })
}

export const handleUploadImage = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
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

export const handleUploadVideo = (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    // keepExtensions: true,
    filter: ({ name, originalFilename, mimetype }) => {
      console.log({ name, originalFilename, mimetype })

      // const valid = name === 'video' && Boolean(mimetype?.includes('video'))

      // if (!valid) {
      //   form.emit('error' as any, new Error('File type is not valid') as any)
      // }

      // return valid
      return true
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new Error('File is empty'))
      }

      const videos = files.video
      videos.forEach((video) => {
        const ext = getExtensionName(video.originalFilename as string)
        fs.renameSync(video.filepath, video.filepath + ext)
        video.newFilename += ext
      })
      return resolve(videos)
    })
  })
}

export const getBaseName = (filename: string) => {
  return path.basename(filename, path.extname(filename))
}

export const getExtensionName = (filename: string) => {
  return path.extname(filename)
}
