import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterRequestBody, UpdateMeRequestBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { Secret, SignOptions } from 'jsonwebtoken'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS_CODE from '~/constants/httpStatusCode'
config()

class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as Secret,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken({
    user_id,
    verify,
    options = { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  }: {
    user_id: string
    verify: UserVerifyStatus
    options?: SignOptions
  }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as Secret,
      options
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as Secret,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as Secret,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  private async signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify })
    ])

    return { access_token, refresh_token }
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        email_verify_token,
        username: `user${user_id.toString()}`
      })
    )

    const { access_token, refresh_token } = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refreshTokens.insertOne(new RefreshToken({ token: refresh_token, user_id }))

    console.log('email_verify_token: ', email_verify_token)

    return { access_token, refresh_token }
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })

    return Boolean(user)
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const { access_token, refresh_token } = await this.signAccessAndRefreshToken({
      user_id,
      verify
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
    )

    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
  }

  async refreshToken({ refresh_token, user_id, exp }: { refresh_token: string; user_id: string; exp: number }) {
    const [_, access_token, new_refresh_token] = await Promise.all([
      databaseService.refreshTokens.deleteOne({ token: refresh_token }),
      this.signAccessToken({ user_id, verify: UserVerifyStatus.Unverified }),
      this.signRefreshToken({ user_id, verify: UserVerifyStatus.Unverified })
    ])
    // await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    // const { refresh_token: new_refresh_token, access_token } = await this.signAccessAndRefreshToken(user_id)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: new_refresh_token, user_id: new ObjectId(user_id) })
    )

    return { access_token, refresh_token: new_refresh_token }
  }

  async verifyEmail(user_id: string) {
    const [{ access_token, refresh_token }] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
            updated_at: '$$NOW'
          }
        }
      ])
    ])

    return { access_token, refresh_token }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    console.log('Resend email verify token: ', email_verify_token)

    return email_verify_token
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    // Gửi kèm đường link đến email người dùng: https://twitter.com/forgot-password?token={forgot_password_token}
    console.log('Send forgot password token: ', forgot_password_token)

    return forgot_password_token
  }

  async resetPassword({ user_id, password }: { user_id: string; password: string }) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }

  async getMe(user_id: string) {
    const result = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return result
  }

  async updateMe({ payload, user_id }: { payload: UpdateMeRequestBody; user_id: string }) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload

    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: { ...(_payload as UpdateMeRequestBody & { date_of_birth?: Date }) },
        $currentDate: {
          updated_at: true
        }
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        },
        returnDocument: 'after'
      }
    )

    return user.value
  }

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )

    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS_CODE.NOT_FOUND
      })
    }
    return user
  }
}

const usersService = new UsersService()
export default usersService
