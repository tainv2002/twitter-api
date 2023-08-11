import express from 'express'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import routes from './routes'
import { initFolders } from './utils/file'
databaseService.connect().catch(console.dir)

const app = express()
const port = 4000

// Tạo folders
initFolders()

app.use(express.json())

routes(app)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(defaultErrorHandler)

app.listen(port, () => {
  console.log(`Twitter server listening on port ${port}`)
})
