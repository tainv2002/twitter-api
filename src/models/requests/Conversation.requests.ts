import { ParamsDictionary } from 'express-serve-static-core'

export interface GetConversationsByReceiverIdRequestParams extends ParamsDictionary {
  receiver_id: string
}
