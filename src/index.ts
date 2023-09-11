import express from 'express'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import routes from './routes'
import { initFolders } from './utils/file'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import cors from 'cors'
import { createServer } from 'http'
import initSocket from './utils/socket'

import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc, { Options } from 'swagger-jsdoc'
import { envConfig } from './constants/config'

// import '~/utils/fake'
// import '~/utils/s3'

// const file = fs.readFileSync(path.resolve('twitter-swagger.yaml'), 'utf8')
// const swaggerDocument = YAML.parse(file)

const options: Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Twitter API',
      version: '1.0.0',
      contact: {
        email: 'taivannho5a@gmail.com'
      }
    },
    servers: [{ url: 'http://localhost:4000' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  // apis: ['./src/routes/*.routes.ts', './src/models/requests/*.requests.ts'] // files containing annotations as above
  apis: ['./openapi/*.yaml']
}

const openapiSpecification = swaggerJSDoc(options)

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
const port = envConfig.port
const httpServer = createServer(app)

// Tạo folders
initFolders()
app.use(cors())
app.use(express.json())

routes(app)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))

app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(defaultErrorHandler)

initSocket(httpServer)

httpServer.listen(port)
