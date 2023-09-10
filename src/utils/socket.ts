import { Server } from 'socket.io'
import Conversation from '~/models/schemas/Conversation.schema'
import { ObjectId } from 'mongodb'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import { verifyAccessToken } from '~/utils/common'
import { TokenPayload } from '~/models/requests/User.requests'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import { config } from 'dotenv'
import databaseService from '~/services/database.services'
import { Server as HttpServer } from 'http'

config()

const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL
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
}

export default initSocket
