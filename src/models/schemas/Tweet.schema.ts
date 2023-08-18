import { AudienceType, TweetType } from '~/constants/enum'
import { Media } from '../Others'
import { ObjectId } from 'mongodb'

interface TweetContructor {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: AudienceType
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
  created_at: Date
  updated_at: Date
}

export default class Tweet {
  _id?: ObjectId
  user_id: ObjectId
  type: TweetType
  audience: AudienceType
  content: string
  parent_id: null | ObjectId
  hashtags: ObjectId[]
  mentions: ObjectId[]
  medias: Media[]
  guest_views: number
  user_views: number
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
    this.guest_views = guest_views
    this.user_views = user_views
    this.hashtags = hashtags
    this.mentions = mentions
    this.medias = medias
    this.parent_id = parent_id
    this.type = type
    this.user_id = user_id
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
