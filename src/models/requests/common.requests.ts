import { Query } from 'express-serve-static-core'

export interface PaginationRequestQuery extends Query {
  page: string
  limit: string
}
