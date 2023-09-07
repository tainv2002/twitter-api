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

      return resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const nanoId = (await import('nanoid')).nanoid
  const idName = nanoId()
  const uploadDir = path.resolve(UPLOAD_VIDEO_DIR, idName)

  fs.mkdirSync(uploadDir)

  const form = formidable({
    uploadDir,
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    filename: function (filename, ext) {
      return idName + ext
    },
    filter: ({ name, originalFilename, mimetype }) => {
      const valid = name === 'video' && Boolean(mimetype?.includes('mp4') || mimetype?.includes('quicktime'))

      if (!valid) {
        fs.rmSync(uploadDir, { recursive: true, force: true })
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
      if (!Boolean(files.video)) {
        return reject(new Error('File is empty'))
      }

      const videos = files.video as File[]
      videos.forEach((video) => {
        const ext = getExtensionName(video.originalFilename as string)
        fs.renameSync(video.filepath, video.filepath + ext)
        video.newFilename += ext
        video.filepath += ext
      })
      return resolve(videos)
    })
  })
}

export const getBasename = (filename: string) => {
  return path.basename(filename, path.extname(filename))
}

export const getExtensionName = (filename: string) => {
  return path.extname(filename)
}

// Recursive function to get files
export const getFiles = (dir: string, files: string[] = []) => {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir)
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the directory path and the files array
      getFiles(name, files)
    } else {
      // If it is a file, push the full path to the files array
      files.push(name)
    }
  }
  return files
}
