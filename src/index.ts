import express from 'express'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import routes from './routes'
import { initFolders } from './utils/file'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import cors, { CorsOptions } from 'cors'
import { createServer } from 'http'
import initSocket from './utils/socket'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc, { Options } from 'swagger-jsdoc'
import { envConfig, isProduction } from './constants/config'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'

// import '~/utils/fake'
// import '~/utils/s3'

const port = envConfig.port

const swaggerJSDocOptions: Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Twitter API',
      version: '1.0.0',
      contact: {
        email: 'taivannho5a@gmail.com'
      }
    },
    servers: [{ url: `http://localhost:${port}` }],
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

const openapiSpecification = swaggerJSDoc(swaggerJSDocOptions)

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
const httpServer = createServer(app)

// Tạo folders
initFolders()

const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.clientUrl : '*'
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-7', // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false // X-RateLimit-* headers
  // store: ... , // Use an external store for more precise rate limiting
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification))

// Apply the rate limiting middleware to all requests
app.use(limiter)
app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json())

routes(app)


app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(defaultErrorHandler)

initSocket(httpServer)

httpServer.listen(port)
