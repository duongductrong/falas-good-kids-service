import { Injectable } from "@nestjs/common"
import { BlockAction } from "@slack/bolt"

interface SubmitVotePayload {
  senderId: string
  receiverId: string
  channelId?: string
  channelName?: string
  clientMessageId?: string
  teamId?: string
}

@Injectable()
export class VoteSlackHelper {
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

  getSelectedOption(body: BlockAction) {
    const values = body?.state?.values
    const selectedOption =
      values?.vote_type_selection?.vote_type_selection?.selected_option

    return selectedOption
  }

  getMessage(body: BlockAction) {
    return body.state.values.my_message_input_block.my_message_input.value || ""
  }
}
