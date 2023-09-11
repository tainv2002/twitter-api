import { Request, Response } from 'express'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { SearchRequestQuery } from '~/models/requests/Search.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import searchService from '~/services/search.services'

export const searchController = async (req: Request<any, any, any, SearchRequestQuery>, res: Response) => {
  const user_id = (req.decoded_authorization as TokenPayload).user_id
  const { content, media_type, people_followed } = req.query
  const limit = +req.query.limit
  const page = +req.query.page

  const { tweets, total } = await searchService.search({
    content,
    limit,
    page,
    user_id,
    media_type,
    people_followed
  })

  return res.json({
    message: SEARCH_MESSAGES.SEARCH_SUCCESSFULLY,
    data: {
      tweets,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}
