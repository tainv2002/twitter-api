import { TweetAudience, TweetType } from '~/constants/enum'
import { Media } from '../Others'
import { ObjectId } from 'mongodb'
import { stringArrayToObjectIdArray } from '~/utils/common'

interface TweetContructor {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string
  hashtags: ObjectId[]
  mentions: string[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date
}

export default class Tweet {
  _id: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views?: number
  user_views?: number
  created_at?: Date
  updated_at?: Date

  constructor({
    _id,
    audience,
    content,
    created_at,
    guest_views,
    hashtags,
    medias,
    mentions,
    parent_id,
    type,
    user_id,
    updated_at,
    user_views
  }: TweetContructor) {
    const date = new Date()
    this._id = _id || new ObjectId()
    this.audience = audience
    this.content = content
    this.guest_views = guest_views || 0
    this.user_views = user_views || 0
    this.hashtags = hashtags
    this.mentions = stringArrayToObjectIdArray(mentions)
    this.medias = medias
    this.parent_id = parent_id ? new ObjectId(parent_id) : null
    this.type = type
    this.user_id = new ObjectId(user_id)
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
