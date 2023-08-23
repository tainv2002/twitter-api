import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { BOOKMARKS_MESSAGE } from '~/constants/messages'
import { validate } from '~/utils/validations'

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
