import { Injectable } from "@nestjs/common"

interface SubmitVotePayload {
  senderId: string
  receiverId: string
  channelId?: string
  channelName?: string
  clientMessageId?: string
  teamId?: string
}

@Injectable()
export class VoteHelper {
  get submitVote() {
    return {
      build(payload: SubmitVotePayload) {
        return JSON.stringify({
          senderId: payload.senderId,
          receiverId: payload.receiverId,
          metadata: {
            channelId: payload.channelId,
            channelName: payload.channelName,
            clientMessageId: payload.clientMessageId,
            teamId: payload.teamId,
          },
        })
      },
      parse: (payload: any) => {
        return JSON.parse(payload?.value || {}) as {
          senderId: string
          receiverId: string
          metadata: {
            channelId?: string
            channelName?: string
            clientMessageId?: string
            teamId?: string
          }
        }
      },
    }
  }
}
