import Bookmark from '~/models/schemas/BookMark.schema'
import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'
import { BOOKMARKS_MESSAGE } from '~/constants/messages'

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

  async unbookmarkTweetByTweetId({ tweet_id, user_id }: { tweet_id: string; user_id: string }) {
    const tweet_object_id = new ObjectId(tweet_id)
    const user_object_id = new ObjectId(user_id)

    await databaseService.bookmarks.deleteOne({
      tweet_id: tweet_object_id,
      user_id: user_object_id
    })

    return {
      message: BOOKMARKS_MESSAGE.UNBOOKMARK_TWEET_SUCCESSFULLY
    }
  }

  async unbookmarkTweetById(bookmark_id: string) {
    await databaseService.bookmarks.deleteOne({
      _id: new ObjectId(bookmark_id)
    })

    return {
      message: BOOKMARKS_MESSAGE.UNBOOKMARK_TWEET_SUCCESSFULLY
    }
  }
}

const bookmarksService = new BookmarksService()
export default bookmarksService
