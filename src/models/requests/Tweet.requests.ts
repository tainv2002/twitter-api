import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from '../Others'
import { ParamsDictionary, Query } from 'express-serve-static-core'

export interface TweetRequestBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: string[]
  mentions: string[]
  medias: Media[]
}

export interface GetTweetRequestParams extends ParamsDictionary {
  tweet_id: string
}

export interface GetTweetChildrenRequestParams extends ParamsDictionary {
  tweet_id: string
}

export interface GetTweetChildrenRequestQuery extends Query {
  page: string
  limit: string
  tweet_type: string
}
