import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const searchRouter = Router()

searchRouter.get('/', accessTokenValidator, wrapRequestHandler(searchController))

export default searchRouter
