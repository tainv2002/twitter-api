import { ObjectId } from 'mongodb'

interface BookmarkType {
  _id?: ObjectId
  tweet_id: ObjectId
  user_id: ObjectId
  created_at?: Date
}

export default class Bookmark {
  _id: ObjectId
  tweet_id: ObjectId
  user_id: ObjectId
  created_at: Date
  constructor({ tweet_id, user_id, _id, created_at }: BookmarkType) {
    this._id = _id || new ObjectId()
    this.tweet_id = tweet_id
    this.user_id = user_id
    this.created_at = created_at || new Date()
  }
}
