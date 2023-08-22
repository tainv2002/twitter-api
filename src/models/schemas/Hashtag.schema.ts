import { ObjectId } from 'mongodb'

interface HashtagType {
  _id?: ObjectId
  name: string
  createdAt?: Date
}

export default class Hashtag {
  _id: ObjectId
  name: string
  createdAt: Date
  constructor({ name, _id, createdAt }: HashtagType) {
    this._id = _id || new ObjectId()
    this.name = name
    this.createdAt = createdAt || new Date()
  }
}
