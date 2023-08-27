import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/HashTag.schema'
import { TWEETS_MESSAGES } from '~/constants/messages'

class TweetsService {
  async checkAndCreateHashtag(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag: string) => {
        // Tìm hashtag trong database, nếu có thì lấy, không có thì tạo mới
        return databaseService.hashtags.findOneAndUpdate(
          {
            name: hashtag
          },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )

    return hashtagDocuments.map((document) => (document.value as WithId<Hashtag>)._id)
  }

  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtag(body.hashtags)

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        ...body,
        user_id: new ObjectId(user_id),
        hashtags
      })
    )

    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })

    return {
      message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESSFULLY,
      data: tweet
    }
  }

  async increaseView({ tweet_id, user_id }: { tweet_id: string; user_id?: string }) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }

    const result = await databaseService.tweets.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1
        }
      }
    )
    return result.value as WithId<{
      guest_views: number
      user_views: number
    }>
  }
}

const tweetsService = new TweetsService()
export default tweetsService
