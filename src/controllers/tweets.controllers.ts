import { Request, Response } from 'express'
import { TweetType } from '~/constants/enums'
import { TWEETS_MESSAGES } from '~/constants/messages'
import {
  GetTweetChildrenRequestParams,
  GetTweetChildrenRequestQuery,
  GetTweetRequestParams,
  TweetRequestBody
} from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetsService from '~/services/tweets.services'

export const createTweetController = async (req: Request<any, any, TweetRequestBody>, res: Response) => {
  const body = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, body)

  return res.json(result)
}

export const getTweetController = async (req: Request<GetTweetRequestParams>, res: Response) => {
  const { tweet_id } = req.params
  const result = await tweetsService.increaseView({
    tweet_id,
    user_id: req.decoded_authorization?.user_id
  })

  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }

  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    data: tweet
  })
}

export const getTweetChildrenController = async (
  req: Request<GetTweetChildrenRequestParams, any, any, GetTweetChildrenRequestQuery>,
  res: Response
) => {
  const { tweet_id } = req.params
  const user_id = req.decoded_authorization?.user_id
  const tweet_type = +req.query.tweet_type as TweetType
  const limit = +req.query.limit
  const page = +req.query.page

  const { total, tweets } = await tweetsService.getTweetChildren({
    tweet_id,
    tweet_type,
    page,
    limit,
    user_id
  })

  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESSFULLY,
    data: {
      tweets: tweets,
      tweet_type,
      page,
      limit,
      total_page: Math.ceil(total / limit)
    }
  })
}
