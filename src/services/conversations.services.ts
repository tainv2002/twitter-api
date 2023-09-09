import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Conversation from '~/models/schemas/Conversation.schema'

class ConversationsService {
  async getConversationsByReceiverId({
    receiver_id,
    sender_id,
    limit,
    page
  }: {
    sender_id: string
    receiver_id: string
    limit: number
    page: number
  }) {
    const receiver_id_sender_id = [new ObjectId(receiver_id), new ObjectId(sender_id)]

    const result = await databaseService.conversations
      .aggregate([
        {
          $match: {
            sender_id: {
              $in: receiver_id_sender_id
            },
            receiver_id: {
              $in: receiver_id_sender_id
            }
          }
        },
        {
          $facet: {
            data: [
              {
                $skip: limit * (page - 1)
              },
              {
                $limit: limit
              },
              {
                $sort: {
                  created_at: 1
                }
              }
            ],
            metadata: [
              {
                $count: 'total_count'
              }
            ]
          }
        }
      ])
      .toArray()

    const conversations = (result?.[0].data || []) as Conversation[]
    const total_count = (result?.[0]?.metadata[0]?.total_count || 0) as number

    return {
      conversations,
      total_count
    }
  }
}

const conversationsService = new ConversationsService()
export default conversationsService
