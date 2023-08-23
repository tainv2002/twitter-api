import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { BOOKMARKS_MESSAGE } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validations'

const schemaValidator = {
  tweet_id: {
    custom: {
      options: async (value: any) => {
        if (!ObjectId.isValid(value)) {
          throw new Error(BOOKMARKS_MESSAGE.TWEET_ID_IS_INVALID)
        }

        const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(value) })
        if (!tweet) {
          throw new Error(BOOKMARKS_MESSAGE.TWEET_NOT_FOUND)
        }
        return true
      }
    }
  }
}

export const bookmartTweetValidator = validate(
  checkSchema(
    {
      tweet_id: schemaValidator.tweet_id
    },
    ['body']
  )
)

export const unbookmartTweetByTweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: schemaValidator.tweet_id
    },
    ['params']
  )
)

export const unbookmartTweetByIdValidator = validate(
  checkSchema(
    {
      bookmark_id: {
        custom: {
          options: async (value: any) => {
            if (!ObjectId.isValid(value)) {
              throw new Error(BOOKMARKS_MESSAGE.BOOKMARK_ID_IS_INVALID)
            }

            // const bookmark = await databaseService.bookmarks.findOne({ _id: new ObjectId(value) })
            // if (!bookmark) {
            //   throw new Error(BOOKMARKS_MESSAGE.BOOKMARK_NOT_FOUND)
            // }
            return true
          }
        }
      }
    },
    ['params']
  )
)
