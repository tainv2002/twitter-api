import { Request, Response } from 'express'
import { BookmarkRequestBody } from '~/models/requests/Bookmark.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarksService from '~/services/bookmarks.services'

export const bookmarkTweetController = async (req: Request<object, object, BookmarkRequestBody>, res: Response) => {
  const { tweet_id } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await bookmarksService.bookmarkTweet({ tweet_id, user_id })

  return res.json(result)
}
