import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../Others'
import { ParamsDictionary } from 'express-serve-static-core'
import { ParsedQs } from 'qs'

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

export interface GetTweetChildrenRequestQuery extends ParsedQs {
  page: string
  limit: string
  tweet_type: string
}
