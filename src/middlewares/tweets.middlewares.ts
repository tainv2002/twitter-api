import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import isEmpty from 'lodash/isEmpty'
import { ObjectId, WithId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.requests'
import Tweet from '~/models/schemas/Tweet.schema'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validations'

const tweetTypes = numberEnumToArray(TweetType)
const tweetAudiences = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)
export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEETS_MESSAGES.TYPE_IS_INVALID
        }
      },
      audience: {
        isIn: {
          options: [tweetAudiences],
          errorMessage: TWEETS_MESSAGES.AUDIENCE_IS_INVALID
        }
      },
      content: {
        isString: {
          errorMessage: TWEETS_MESSAGES.CONTENT_MUST_BE_A_STRING
        },
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            const hashtags = req.body.hashtags as string[]
            const mentions = req.body.mentions as string[]

            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              value === ''
            ) {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
            }

            if (type === TweetType.Retweet && value !== '') {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING)
            }
            return true
          }
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const type = req.body.type as TweetType
            if (type === TweetType.Tweet) {
              if (value) throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
            } else {
              if (!ObjectId.isValid(value)) throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: {
          errorMessage: TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING,
          bail: true
        },
        custom: {
          options: (value: []) => {
            if (!value.every((x) => typeof x === 'string')) {
              throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
            }
            return true
          }
        }
      },
      mentions: {
        isArray: {
          errorMessage: TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID,
          bail: true
        },
        custom: {
          options: (value: []) => {
            if (!value.every((x) => ObjectId.isValid(x))) {
              throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
            }
            return true
          }
        }
      },
      medias: {
        // isArray: {
        //   errorMessage: TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT,
        //   bail: true
        // },
        custom: {
          options: (value: []) => {
            if (
              !value.every((x: any) => {
                return typeof x.url === 'string' && mediaTypes.includes(x.type)
              })
            ) {
              throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS_CODE.BAD_REQUEST,
                message: TWEETS_MESSAGES.TWEET_ID_IS_INVALID
              })
            }

            const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(value) })
            if (!tweet) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.TWEET_NOT_FOUND,
                status: HTTP_STATUS_CODE.NOT_FOUND
              })
            }

            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['body', 'params']
  )
)

export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as WithId<Tweet>

  if (tweet.audience === TweetAudience.Everyone) {
    return next()
  }

  // Kiểm tra người xem tweet này đã đăng nhập hay chưa
  if (!req.decoded_authorization) {
    return next(
      new ErrorWithStatus({
        status: HTTP_STATUS_CODE.UNAUTHORIZED,
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
      })
    )
  }

  // Kiểm tra trạng thái tài khoản tác giả
  const author = await databaseService.users.findOne({ _id: new ObjectId(tweet.user_id) })
  if (!author || author.verify === UserVerifyStatus.Banned) {
    return next(
      new ErrorWithStatus({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      })
    )
  }

  const { user_id } = req.decoded_authorization as TokenPayload
  // Kiểm tra người xem tweet có nằm trong twitter circle của tác giả hay không

  const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))
  if (!isInTwitterCircle && !author._id.equals(user_id)) {
    return next(
      new ErrorWithStatus({
        status: HTTP_STATUS_CODE.FORBIDDEN,
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
      })
    )
  }

  next()
}
