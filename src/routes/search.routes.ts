import { Router } from 'express'
import { searchController } from '~/controllers/search.controllers'
import { wrapRequestHandler } from '~/utils/handlers'

const searchRouter = Router()

searchRouter.get('/', wrapRequestHandler(searchController))

export default searchRouter
