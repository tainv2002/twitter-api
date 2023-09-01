import { MediaTypeQuery, PeopleFollowedQuery } from '~/constants/enums'
import { PaginationRequestQuery } from './common.requests'

export interface SearchRequestQuery extends PaginationRequestQuery {
  content: string
  media_type: MediaTypeQuery
  people_followed: PeopleFollowedQuery
}
