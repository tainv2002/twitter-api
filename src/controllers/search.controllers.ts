import { Request, Response } from 'express'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { SearchRequestQuery } from '~/models/requests/Search.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import searchService from '~/services/search.services'

export const searchController = async (req: Request<any, any, any, SearchRequestQuery>, res: Response) => {
  const user_id = (req.decoded_authorization as TokenPayload).user_id
  const content = req.query.content
  const limit = +req.query.limit
  const page = +req.query.page

  const { tweets, tweets_count } = await searchService.search({ content, limit, page, user_id })

  return res.json({
    message: SEARCH_MESSAGES.SEARCH_SUCCESSFULLY,
    data: {
      tweets,
      limit,
      page,
      total_page: Math.ceil(tweets_count / limit)
    }
  })
}
