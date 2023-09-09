import { Router } from 'express'
import { getConversationsByReceiverIdController } from '~/controllers/conversations.controller'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import {
  accessTokenValidator,
  getConversationsByReceiverIdValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const conversationsRouter = Router()

/**
 * Description: Get conversations by receiver_id
 * Path: /receivers/:receiver_id
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 * Query: { limit, page }
 */
conversationsRouter.get(
  '/receivers/:receiver_id',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  getConversationsByReceiverIdValidator,
  wrapRequestHandler(getConversationsByReceiverIdController)
)

export default conversationsRouter
