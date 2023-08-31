import { TweetAudience, TweetType } from '~/constants/enums'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import Tweet from '~/models/schemas/Tweet.schema'

class SearchService {
  async search({ user_id, content, limit, page }: { user_id: string; content: string; limit: number; page: number }) {
    const user_object_id = new ObjectId(user_id)
    const date = new Date()

    const result = await databaseService.tweets
      .aggregate([
        {
          $match: {
            $text: {
              $search: content
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

    const tweets = (result[0]?.data || []) as Tweet[]
    const tweets_count = (result[0]?.metadata[0].totalCount || 0) as number

    const tweet_ids = tweets.map((tweet) => {
      tweet.user_views += 1
      tweet.updated_at = date
      return tweet._id
    })

    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        $set: {
          updated_at: date
        }
      }
    )

    return { tweets, tweets_count }
  }
}

const searchService = new SearchService()
export default searchService
