import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { config } from 'dotenv'
import Follow from '~/models/schemas/Follower.schema'
import VideoStatus from '~/models/schemas/VideoStatus.Schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Like from '~/models/schemas/Like.schema'
config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.pkgpwis.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successful connected to MongoDB!')
    } finally {
      // Ensures that the client will close when you finish/error
      // await this.client.close()
    }
  }

  async indexUsers() {
    const EMAIL_PASSWORD_INDEX_NAME = 'email_1_password_1'
    const EMAIL_INDEX_NAME = 'email_1'
    const USERNAME_INDEX_NAME = 'username_1'

    const isExisted = await this.users.indexExists([EMAIL_PASSWORD_INDEX_NAME, EMAIL_INDEX_NAME, USERNAME_INDEX_NAME])

    if (!isExisted) {
      this.users.createIndex({ email: 1, password: 1 }, { name: EMAIL_PASSWORD_INDEX_NAME })
      this.users.createIndex({ email: 1 }, { unique: true, name: EMAIL_INDEX_NAME })
      this.users.createIndex({ username: 1 }, { unique: true, name: USERNAME_INDEX_NAME })
    }
  }

  async indexRefreshTokens() {
    const TOKEN_INDEX_NAME = 'token_1'
    const EXP_INDEX_NAME = 'exp_1'

    const isExisted = await this.refreshTokens.indexExists([TOKEN_INDEX_NAME, EXP_INDEX_NAME])

    if (!isExisted) {
      this.refreshTokens.createIndex({ token: 1 }, { name: TOKEN_INDEX_NAME })
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0, name: EXP_INDEX_NAME })
    }
  }

  async indexVideoStatus() {
    const NAME_INDEX_NAME = 'name_1'

    const isExisted = await this.refreshTokens.indexExists([NAME_INDEX_NAME])

    if (!isExisted) {
      this.videoStatus.createIndex({ name: 1 }, { name: NAME_INDEX_NAME })
    }
  }

  async indexFollowers() {
    const USER_ID_FOLLOWED_USER_ID_INDEX_NAME = 'user_id_1_followed_user_id_1'

    const isExisted = await this.refreshTokens.indexExists([USER_ID_FOLLOWED_USER_ID_INDEX_NAME])
    if (!isExisted) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 }, { name: USER_ID_FOLLOWED_USER_ID_INDEX_NAME })
    }
  }

  async indexHashtags() {
    const NAME_INDEX_NAME = 'name_1'

    const isExisted = await this.hashtags.indexExists([NAME_INDEX_NAME])
    if (!isExisted) {
      this.hashtags.createIndex({ name: 1 }, { name: NAME_INDEX_NAME })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get followers(): Collection<Follow> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string)
  }

  get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_LIKES_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
