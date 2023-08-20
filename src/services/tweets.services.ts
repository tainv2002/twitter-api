import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'

class TweetsService {
  async createTweet(user_id: string, body: TweetRequestBody) {
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        ...body,
        user_id: new ObjectId(user_id),
        hashtags: []
      })
    )

    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })

    return tweet
  }
}

const tweetsService = new TweetsService()
export default tweetsService
