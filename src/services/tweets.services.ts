import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/HashTag.schema'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetType } from '~/constants/enum'

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
          user_views: 1,
          updated_at: true
        }
      }
    )
    return result.value as WithId<{
      guest_views: number
      user_views: number
      updated_at: Date
    }>
  }

  async getTweetChildren({
    tweet_id,
    tweet_type,
    page,
    limit,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    page: number
    limit: number
    user_id?: string
  }) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  email: '$$mention.email',
                  username: '$$mention.username',
                  name: '$$mention.name'
                }
              }
            },
            bookmarks: {
              $size: '$bookmarks'
            },
            likes: {
              $size: '$likes'
            },
            retweets_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Retweet]
                  }
                }
              }
            },
            comments_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Comment]
                  }
                }
              }
            },
            quotes_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.QuoteTweet]
                  }
                }
              }
            }
          }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }

    const ids = tweets.map((tweet) => tweet._id)
    const date = new Date()

    const [, total] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type
      })
    ])

    tweets.forEach((tweet) => {
      tweet.guest_views += 1
      tweet.user_views += 1
      tweet.updated_at = date
    })

    return {
      tweets,
      total
    }
  }
}

const tweetsService = new TweetsService()
export default tweetsService
