import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { BOOKMARKS_MESSAGE } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validations'

export const bookmartTweetValidator = validate(
  checkSchema({
    tweet_id: {
      custom: {
        options: async (value) => {
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
  })
)
