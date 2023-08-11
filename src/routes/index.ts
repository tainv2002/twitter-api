import { type Express } from 'express'
import usersRouter from './users.routes'
import mediasRouter from './medias.routes'

const routes = (app: Express) => {
  app.use('/users', usersRouter)
  app.use('/medias', mediasRouter)
}

export default routes
