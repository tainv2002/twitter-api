import { NextFunction, Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'

export const uploadSingleImageController = (req: Request, res: Response, next: NextFunction) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    maxFileSize: 800 * 1024, // 800KB
    keepExtensions: true
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(err)
    }
    return res.json({
      message: 'Upload image successfully',
      data: {
        fields,
        files
      }
    })
  })
}
