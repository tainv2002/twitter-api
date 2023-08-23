import { type Express } from 'express'
import usersRouter from './users.routes'
import mediasRouter from './medias.routes'
import staticRouter from './static.routes'
import tweetsRouter from './tweets.routes'
import bookmarksRouter from './bookmarks.routes'

const routes = (app: Express) => {
  app.use('/users', usersRouter)
  app.use('/medias', mediasRouter)
  app.use('/static', staticRouter)
  app.use('/tweets', tweetsRouter)
  app.use('/bookmarks', bookmarksRouter)
}

export default routes
