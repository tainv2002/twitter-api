import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterRequestBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { Secret, SignOptions } from 'jsonwebtoken'
config()

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as Secret,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken(
    user_id: string,
    options: SignOptions = { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  ) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as Secret,
      options
    })
  }

  private signEmailVerifyToken(
    user_id: string,
    options: SignOptions = { expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN }
  ) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as Secret,
      options
    })
  }

  private signForgotPasswordToken(
    user_id: string,
    options: SignOptions = { expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN }
  ) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as Secret,
      options
    })
  }

  private async signAccessAndRefreshToken(user_id: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])

    return { access_token, refresh_token }
  }

  async register(payload: RegisterRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(user_id.toString())

    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        email_verify_token
      })
    )

    const { access_token, refresh_token } = await this.signAccessAndRefreshToken(user_id.toString())
    await databaseService.refreshTokens.insertOne(new RefreshToken({ token: refresh_token, user_id }))

    console.log('email_verify_token: ', email_verify_token)

    return { access_token, refresh_token }
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })

    return Boolean(user)
  }

  async login(user_id: string) {
    const { access_token, refresh_token } = await this.signAccessAndRefreshToken(user_id)
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
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
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
      this.signAccessAndRefreshToken(user_id),
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
    const email_verify_token = await this.signEmailVerifyToken(user_id)

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

  async forgotPassword(user_id: string) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id)

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
}

const usersService = new UsersService()
export default usersService
