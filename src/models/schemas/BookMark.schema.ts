import { ObjectId } from 'mongodb'

interface BookMarkType {
  _id?: ObjectId
  tweet_id: ObjectId
  user_id: ObjectId
  createdAt?: Date
}

export default class BookMark {
  _id?: ObjectId
  tweet_id: ObjectId
  user_id: ObjectId
  createdAt?: Date
  constructor({ tweet_id, user_id, _id, createdAt }: BookMarkType) {
    this._id = _id || new ObjectId()
    this.tweet_id = tweet_id
    this.user_id = user_id
    this.createdAt = createdAt || new Date()
  }
}
