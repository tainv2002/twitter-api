import { PaginationRequestQuery } from './common.requests'

export interface SearchRequestQuery extends PaginationRequestQuery {
  content: string
}
