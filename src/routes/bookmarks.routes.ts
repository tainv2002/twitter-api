import { Router } from 'express'
import { bookmarkTweetController, unbookmarkTweetByTweetIdController } from '~/controllers/bookmarks.controllers'
import {
  bookmartTweetValidator,
  unbookmartTweetByIdValidator,
  unbookmartTweetByTweetIdValidator
} from '~/middlewares/bookmarks.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const bookmarksRouter = Router()

/**
 * Description: Bookmark tweet
 * Path: /
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: BookmarkRequestBody
 */
bookmarksRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  bookmartTweetValidator,
  wrapRequestHandler(bookmarkTweetController)
)

/**
 * Description: Unbookmark tweet by tweet id
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.delete(
  '/tweets/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  unbookmartTweetByTweetIdValidator,
  wrapRequestHandler(unbookmarkTweetByTweetIdController)
)

/**
 * Description: Unbookmark tweet by bookmark id
 * Path: /:bookmark_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */
bookmarksRouter.delete(
  '/:bookmark_id',
  accessTokenValidator,
  verifiedUserValidator,
  unbookmartTweetByIdValidator,
  wrapRequestHandler(unbookmarkTweetByTweetIdController)
)
export default bookmarksRouter
