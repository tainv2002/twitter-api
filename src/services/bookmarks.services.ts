import Bookmark from '~/models/schemas/Bookmark.schema'
import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'
import { BOOKMARKS_MESSAGE, TWEETS_MESSAGES } from '~/constants/messages'

class BookmarksService {
  async bookmarkTweet({ tweet_id, user_id }: { tweet_id: string; user_id: string }) {
    const tweet_object_id = new ObjectId(tweet_id)
    const user_object_id = new ObjectId(user_id)

    const result = await databaseService.bookmarks.findOneAndUpdate(
      { tweet_id: tweet_object_id, user_id: user_object_id },
      {
        $setOnInsert: new Bookmark({ tweet_id: tweet_object_id, user_id: user_object_id })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return {
      message: BOOKMARKS_MESSAGE.BOOKMARK_TWEET_SUCCESSFULLY,
      data: result.value as WithId<Bookmark>
    }
  }
}

const bookmarksService = new BookmarksService()
export default bookmarksService
