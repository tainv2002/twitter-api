import express from 'express'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import routes from './routes'
import { initFolders } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import Conversation from './models/schemas/Conversation.schema'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from './models/Errors'
import { USERS_MESSAGES } from './constants/messages'
import { verifyAccessToken } from './utils/common'
import { ExtendedError } from 'node_modules/socket.io/dist/namespace'
import { TokenPayload } from './models/requests/User.requests'
import { UserVerifyStatus } from './constants/enums'
import HTTP_STATUS_CODE from './constants/httpStatusCode'

// import '~/utils/fake'
// import '~/utils/s3'

config()
databaseService
  .connect()
  .then(() => {
    databaseService.indexUsers()
    databaseService.indexRefreshTokens()
    databaseService.indexVideoStatus()
    databaseService.indexFollowers()
    databaseService.indexHashtags()
    databaseService.indexTweets()
    databaseService.indexConversations()
  })
  .catch(console.dir)

const app = express()
const port = process.env.PORT || 4001
const httpServer = createServer(app)

// Tạo folders
initFolders()
app.use(cors())
app.use(express.json())

routes(app)

app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(defaultErrorHandler)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

const users: Record<string, { socket_id: string }> = {}

io.use(async (socket, next) => {
  const { Authorization } = socket.handshake.auth
  const access_token = Authorization?.split(' ')[1]

  try {
    const decoded_authorization = (await verifyAccessToken(access_token)) as TokenPayload
    const { verify } = decoded_authorization

    if (verify !== UserVerifyStatus.Verified) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS_CODE.FORBIDDEN
      })
    }

    socket.handshake.auth.decoded_authorization = decoded_authorization
    socket.handshake.auth.access_token = access_token

    next()
  } catch (error) {
    next({
      message: 'Unauthorized',
      name: 'UnauthorizedError',
      data: error
    })
  }
})

io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`)

  const user_id = (socket.handshake.auth.decoded_authorization as TokenPayload).user_id as string
  users[user_id] = {
    socket_id: socket.id
  }

  socket.use(async (packet, next) => {
    const { access_token } = socket.handshake.auth

    try {
      await verifyAccessToken(access_token)
    } catch (error) {
      next(new Error('Unauthorized'))
    }
  })

  socket.on('error', (error) => {
    if (error.message === 'Unauthorized') {
      socket.disconnect()
    }
  })

  socket.on('send_message', async (data) => {
    const { payload } = data
    const receiver_socket_id = users[payload.receiver_id]?.socket_id

    const conversation = new Conversation({
      ...payload,
      _id: new ObjectId(),
      receiver_id: new ObjectId(payload.receiver_id),
      sender_id: new ObjectId(payload.sender_id)
    })

    await databaseService.conversations.insertOne(conversation)

    if (receiver_socket_id) {
      socket.to(receiver_socket_id).emit('receive_message', {
        payload: conversation
      })
    }
  })

  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
  })
})

httpServer.listen(port)
