import { Request, Response } from 'express'
import { CONVERSATIONS_MESSAGE } from '~/constants/messages'
import { GetConversationsByReceiverIdRequestParams } from '~/models/requests/Conversation.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import { PaginationRequestQuery } from '~/models/requests/common.requests'
import conversationsService from '~/services/conversations.services'

export const getConversationsByReceiverIdController = async (
  req: Request<GetConversationsByReceiverIdRequestParams, any, any, PaginationRequestQuery>,
  res: Response
) => {
  const { receiver_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const limit = +req.query.limit
  const page = +req.query.page

  const result = await conversationsService.getConversationsByReceiverId({
    receiver_id,
    sender_id: user_id,
    limit: +limit,
    page: +page
  })

  return res.json({
    message: CONVERSATIONS_MESSAGE.GET_CONVERSATIONS_BY_RECEIVER_ID_SUCCESSFULLY,
    data: {
      conversations: result.conversations,
      page,
      limit,
      total_page: Math.ceil(result.total_count / limit)
    }
  })
}
