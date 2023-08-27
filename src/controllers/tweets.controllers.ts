import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import Tweet from '~/models/schemas/Tweet.schema'
import tweetsService from '~/services/tweets.services'

export const createTweetController = async (req: Request<object, object, TweetRequestBody>, res: Response) => {
  const body = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, body)

  return res.json(result)
}

export const getTweetController = async (req: Request, res: Response) => {
  const { tweet_id } = req.params
  const result = await tweetsService.increaseView({
    tweet_id,
    user_id: req.decoded_authorization?.user_id
  })

  const tweet = { ...req.tweet, guest_views: result.guest_views, user_views: result.user_views }

  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    data: tweet
  })
}

export const getTweetChildrenController = async (req: Request, res: Response) => {
  const { tweet_id } = req.params
  const result = await tweetsService.increaseView({
    tweet_id,
    user_id: req.decoded_authorization?.user_id
  })

  const tweet = { ...req.tweet, guest_views: result.guest_views, user_views: result.user_views }

  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    data: tweet
  })
}
