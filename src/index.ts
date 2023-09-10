import express from 'express'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import routes from './routes'
import { initFolders } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import cors from 'cors'
import { createServer } from 'http'
import initSocket from './utils/socket'

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

initSocket(httpServer)

httpServer.listen(port)
