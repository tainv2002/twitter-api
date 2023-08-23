import { checkSchema } from 'express-validator'
import isEmpty from 'lodash/isEmpty'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enum'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
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
          options: async (value) => {
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
            return true
          }
        }
      }
    },
    ['body', 'params']
  )
)
