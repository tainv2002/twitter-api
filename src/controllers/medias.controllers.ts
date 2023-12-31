import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import fs from 'fs'
import mime from 'mime'
import { sendFileFromS3 } from '~/utils/s3'

export const uploadImageController = async (req: Request, res: Response) => {
  const urls = await mediasService.uploadImage(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_IMAGE_SUCCESSFULLY,
    data: urls
  })
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const urls = await mediasService.uploadVideo(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_VIDEO_SUCCESSFULLY,
    data: urls
  })
}

export const uploadVideoHLSController = async (req: Request, res: Response) => {
  const urls = await mediasService.uploadVideoHLS(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_VIDEO_SUCCESSFULLY,
    data: urls
  })
}

export const serveImageController = (req: Request, res: Response) => {
  const { name } = req.params

  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      return res.status((err as any).status).send('Not found')
    }
  })
}

export const serveVideoStreamController = (req: Request, res: Response) => {
  const { range } = req.headers
  if (!range) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).send('Requires Range header')
  }

  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  // 1MB = 10^6 bytes (Tính theo hệ 10)
  // Hệ nhị phân: 1MB = 2^20 bytes (1024 * 1024)
  const videoSize = fs.statSync(videoPath).size // bytes
  // Dung lượng video cho mỗi phân đoạn stream
  const chunkSize = 10 ** 6 // 1MB
  // Lấy giá trị byte bắt đầu từ header Range (vd: bytes=655360-)
  const start = Number(range.replace(/\D/g, ''))
  // Lấy giá trị byte kết thúc
  const end = Math.min(start + chunkSize, videoSize - 1)

  // Dung lượng thực tế cho mỗi đoạn video stream
  // Thường đây sẽ là chunk size, ngoại trừ đoạn cuối cùng
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Accept-Ranges': 'bytes',
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Content-Length': contentLength,
    'Content-Type': contentType
  }

  res.writeHead(HTTP_STATUS_CODE.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}

export const serveVideoM3u8Controller = async (req: Request, res: Response) => {
  const { id } = req.params
  const s3filepath = `videos-hls/${id}/master.m3u8`

  await sendFileFromS3(res, s3filepath)
}

export const serveSegmentController = async (req: Request, res: Response) => {
  const { id, v, segment } = req.params
  const s3filepath = `videos-hls/${id}/${v}/${segment}`

  await sendFileFromS3(res, s3filepath)
}

export const getVideoStatusController = async (req: Request, res: Response) => {
  const { id } = req.params

  const data = await mediasService.getVideoStatus(id)
  return res.json({
    message: USERS_MESSAGES.ACCESS_TOKEN_IS_INVALID,
    data
  })
}
