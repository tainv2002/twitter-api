import { Request, Response } from 'express'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { SearchRequestQuery } from '~/models/requests/Search.requests'
import searchService from '~/services/search.services'

export const searchController = async (req: Request<any, any, any, SearchRequestQuery>, res: Response) => {
  const content = req.query.content
  const limit = +req.query.limit
  const page = +req.query.page

  const data = await searchService.search({ content, limit, page })

  return res.json({
    message: SEARCH_MESSAGES.SEARCH_SUCCESSFULLY,
    data
  })
}
