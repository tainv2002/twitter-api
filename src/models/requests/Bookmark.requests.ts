import { ParamsDictionary } from 'express-serve-static-core'

export interface BookmarkRequestBody {
  tweet_id: string
}

export interface UnbookmarkByTweetIdRequestParams extends ParamsDictionary {
  tweet_id: string
}

export interface UnbookmarkByIdRequestParams extends ParamsDictionary {
  bookmark_id: string
}
