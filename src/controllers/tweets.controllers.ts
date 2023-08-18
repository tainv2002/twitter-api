import { Request, Response } from 'express'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'

export const createTweetController = (req: Request<object, object, TweetRequestBody>, res: Response) => {
  console.log(req.body)

  return res.json({
    message: 'Create Tweet successfully'
  })
}
