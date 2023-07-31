import { Request } from 'express'
import { WithId } from 'mongodb'
import User from './models/schemas/User.schema'

declare module 'express' {
  interface Request {
    user?: WithId<User>
  }
}
