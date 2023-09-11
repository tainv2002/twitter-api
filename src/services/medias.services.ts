import { Request } from 'express'
import { getBasename, getFiles, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import path from 'path'
import fsPromise from 'fs/promises'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { envConfig, isProduction } from '~/constants/config'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.Schema'
import { uploadFileToS3 } from '~/utils/s3'
import mime from 'mime'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }

  async enqueue(item: string) {
    this.items.push(item)
    const idName = getBasename(item)
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }

  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getBasename(videoPath)
      await databaseService.videoStatus.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updatedAt: true
          }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()

        const videoDir = path.resolve(UPLOAD_VIDEO_DIR, idName)
        const files = getFiles(videoDir)
        await Promise.all(
          files.map((filepath) => {
            const filename = 'videos-hls' + filepath.replace(path.resolve(UPLOAD_VIDEO_DIR), '').replace(/\\/g, '/')

            return uploadFileToS3({
              filepath,
              filename,
              contentType: mime.getType(filepath) as string
            })
          })
        )

        await Promise.all([fsPromise.unlink(videoPath), fsPromise.rm(videoDir, { recursive: true, force: true })])

        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: {
              status: EncodingStatus.Fulfilled
            },
            $currentDate: {
              updatedAt: true
            }
          }
        )
        console.log(`Encode video ${videoPath} successfully`)
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodingStatus.Rejected
              },
              $currentDate: {
                updatedAt: true
              }
            }
          )
          .catch((error) => {
            console.error('Update video status failed', error)
          })
        console.error(`Encode video ${videoPath} failed`)
        console.error(error)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}

const queue = new Queue()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result = await Promise.all<Media>(
      files.map(async (file) => {
        const newName = getBasename(file.newFilename) + '.jpg'
        const newPath = path.join(UPLOAD_IMAGE_DIR, newName)
        await sharp(file.filepath).jpeg().toFile(newPath)
        const s3Result = await uploadFileToS3({
          filename: 'images/' + newName,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })

        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
      })
    )

    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          filepath: file.filepath,
          contentType: mime.getType(file.filepath) as string
        })

        const videoDir = path.resolve(UPLOAD_VIDEO_DIR, getBasename(file.newFilename))

        await fsPromise.rm(videoDir, { force: true, recursive: true })

        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }
      })
    )

    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const basename = getBasename(file.newFilename)
        queue.enqueue(file.filepath)

        return {
          url: isProduction
            ? `${envConfig.host}/static/video-hls/${basename}/master.m3u8`
            : `http://localhost:${envConfig.port}/static/video-hls/${basename}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }

  async getVideoStatus(id: string) {
    const result = await databaseService.videoStatus.findOne({ name: id })
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
