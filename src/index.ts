import express from 'express'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import routes from './routes'
import { initFolders } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
config()
databaseService.connect().catch(console.dir)

const app = express()
const port = process.env.PORT || 4001

// Tạo folders
initFolders()

app.use(express.json())

routes(app)

app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Twitter server listening on port ${port}`)
})
