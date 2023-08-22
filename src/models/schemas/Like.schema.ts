import { ObjectId } from 'mongodb'

interface LikeType {
  _id?: ObjectId
  tweet_id: ObjectId
  user_id: ObjectId
  createdAt?: Date
}

export default class Like {
  _id?: ObjectId
  tweet_id: ObjectId
  user_id: ObjectId
  createdAt?: Date
  constructor({ tweet_id, user_id, _id, createdAt }: LikeType) {
    this._id = _id || new ObjectId()
    this.tweet_id = tweet_id
    this.user_id = user_id
    this.createdAt = createdAt || new Date()
  }
}
