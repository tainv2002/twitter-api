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

// app.listen(port, () => {
//   console.log(`Twitter server listening on port ${port}`)
// })

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

const users: Record<string, { socket_id: string }> = {}

io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`)

  const user_id = socket.handshake.auth._id as string
  users[user_id] = {
    socket_id: socket.id
  }
  console.log(users)

  socket.on('send_message', async (data) => {
    const { payload } = data
    const receiver_socket_id = users[payload.receiver_id]?.socket_id

    if (!receiver_socket_id) return

    const conversation = new Conversation({
      ...payload,
      _id: new ObjectId(),
      receiver_id: new ObjectId(payload.receiver_id),
      sender_id: new ObjectId(payload.sender_id)
    })

    await databaseService.conversations.insertOne(conversation)

    socket.to(receiver_socket_id).emit('receive_message', {
      payload: conversation
    })
  })

  socket.on('disconnect', () => {
    delete users[user_id]
    console.log(`user ${socket.id} disconnected`)
    console.log(users)
  })
})

httpServer.listen(port)
