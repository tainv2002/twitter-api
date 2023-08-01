/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
import { TokenPayload } from '~/models/requests/User.requests'
config()

export const signToken = async ({
  payload,
  privateKey = process.env.JWT_SECRET as jwt.Secret,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: any
  privateKey?: jwt.Secret
  options?: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, function (err, token) {
      if (err) {
        throw reject(err)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = async ({
  token,
  secretOrPublicKey = process.env.JWT_SECRET as jwt.Secret
}: {
  token: string
  secretOrPublicKey?: jwt.Secret
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, function (err, decoded) {
      if (err) {
        return reject(err)
      }
      resolve(decoded as TokenPayload)
    })
  })
}
