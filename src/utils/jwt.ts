/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken'

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
