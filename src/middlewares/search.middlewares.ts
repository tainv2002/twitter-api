import { checkSchema } from 'express-validator'
import { MediaTypeQuery, PeopleFollowedQuery } from '~/constants/enums'
import { SEARCH_MESSAGES } from '~/constants/messages'
import { stringEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validations'

const mediaTypes = stringEnumToArray(MediaTypeQuery)
const peopleFollowedTypes = stringEnumToArray(PeopleFollowedQuery)

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: SEARCH_MESSAGES.CONTENT_MUST_BE_A_STRING
        }
      },
      media_type: {
        optional: true,
        isIn: {
          options: [mediaTypes],
          errorMessage: SEARCH_MESSAGES.INVALID_MEDIA_TYPE
        }
      },
      people_followed: {
        optional: true,
        isIn: {
          options: [peopleFollowedTypes],
          errorMessage: SEARCH_MESSAGES.INVALID_PEOPLE_FOLLOWED
        }
      }
    },
    ['query']
  )
)
