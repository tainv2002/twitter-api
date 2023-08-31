import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetAudience, TweetType } from '~/constants/enums'

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
    const result = await databaseService.tweets
      .aggregate([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        {
          $facet: {
            metadata: [
              {
                $count: 'totalCount'
              }
            ],
            data: [
              {
                $skip: limit * (page - 1)
              },
              {
                $limit: limit
              }
            ]
          }
        },
        {
          $unwind: {
            path: '$data'
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'data.hashtags',
            foreignField: '_id',
            as: 'data.hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'data.mentions',
            foreignField: '_id',
            as: 'data.mentions'
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: 'data._id',
            foreignField: 'tweet_id',
            as: 'data.bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: 'data._id',
            foreignField: 'tweet_id',
            as: 'data.likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: 'data._id',
            foreignField: 'parent_id',
            as: 'data.tweet_children'
          }
        },
        {
          $addFields: {
            'data.mentions': {
              $map: {
                input: '$data.mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  email: '$$mention.email',
                  username: '$$mention.username',
                  name: '$$mention.name'
                }
              }
            },
            'data.bookmarks': {
              $size: '$data.bookmarks'
            },
            'data.likes': {
              $size: '$data.likes'
            },
            'data.retweets_count': {
              $size: {
                $filter: {
                  input: '$data.tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Retweet]
                  }
                }
              }
            },
            'data.comments_count': {
              $size: {
                $filter: {
                  input: '$data.tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Comment]
                  }
                }
              }
            },
            'data.quotes_count': {
              $size: {
                $filter: {
                  input: '$data.tweet_children',
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
          $group: {
            _id: null,
            data: {
              $push: '$data'
            },
            metadata: {
              $first: '$metadata'
            }
          }
        },
        {
          $unset: ['_id', 'data.tweet_children']
        }
      ])
      .toArray()

    const tweets = result[0].data as Tweet[]
    const tweets_count = result[0].metadata[0].totalCount as number

    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }

    const date = new Date()

    const ids = tweets.map((tweet) => {
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }

      tweet.updated_at = date
      return tweet._id
    })

    await databaseService.tweets.updateMany(
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
    )

    return {
      tweets,
      total: tweets_count
    }
  }

  async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const user_object_id = new ObjectId(user_id)

    const followed_users = await databaseService.followers
      .find(
        { user_id: user_object_id },
        {
          projection: {
            followed_user_id: 1,
            _id: 0
          }
        }
      )
      .toArray()

    const date = new Date()

    const followed_user_ids = followed_users.map((item) => item.followed_user_id)
    followed_user_ids.push(user_object_id)

    const result = await databaseService.tweets
      .aggregate([
        {
          $match: {
            user_id: {
              $in: followed_user_ids
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user'
          }
        },
        {
          $match: {
            $or: [
              {
                audience: TweetAudience.Everyone
              },
              {
                $and: [
                  {
                    audience: TweetAudience.TwitterCircle
                  },
                  {
                    'user.twitter_circle': {
                      $in: [user_object_id]
                    }
                  }
                ]
              }
            ]
          }
        },
        {
          $facet: {
            data: [
              {
                $skip: limit * (page - 1)
              },
              {
                $limit: limit
              }
            ],
            metadata: [
              {
                $count: 'totalCount'
              }
            ]
          }
        },
        {
          $unwind: {
            path: '$data'
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'data.hashtags',
            foreignField: '_id',
            as: 'data.hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'data.mentions',
            foreignField: '_id',
            as: 'data.mentions'
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: 'data._id',
            foreignField: 'tweet_id',
            as: 'data.bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: 'data._id',
            foreignField: 'tweet_id',
            as: 'data.likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: 'data._id',
            foreignField: 'parent_id',
            as: 'data.tweet_children'
          }
        },
        {
          $addFields: {
            'data.mentions': {
              $map: {
                input: '$data.mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  email: '$$mention.email',
                  username: '$$mention.username',
                  name: '$$mention.name'
                }
              }
            },
            'data.bookmarks': {
              $size: '$data.bookmarks'
            },
            'data.likes': {
              $size: '$data.likes'
            },
            'data.retweets_count': {
              $size: {
                $filter: {
                  input: '$data.tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Retweet]
                  }
                }
              }
            },
            'data.comments_count': {
              $size: {
                $filter: {
                  input: '$data.tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', TweetType.Comment]
                  }
                }
              }
            },
            'data.quotes_count': {
              $size: {
                $filter: {
                  input: '$data.tweet_children',
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
          $project: {
            data: {
              tweet_children: 0,
              user: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                date_of_birth: 0
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            data: {
              $push: '$data'
            },
            metadata: {
              $first: '$metadata'
            }
          }
        },
        {
          $unset: '_id'
        }
      ])
      .toArray()

    const tweets = result[0].data as Tweet[]
    const tweets_count = result[0].metadata[0].totalCount as number

    const tweet_ids = tweets.map((tweet) => {
      tweet.user_views += 1
      tweet.updated_at = date
      return tweet._id
    })

    await databaseService.tweets.updateMany(
      {
        _id: { $in: tweet_ids }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )

    return {
      tweets,
      total: tweets_count
    }
  }
}

const tweetsService = new TweetsService()
export default tweetsService
