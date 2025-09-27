import { Inject, Injectable } from "@nestjs/common"
import { RespondFn } from "@slack/bolt"
import { UsersProfileGetResponse } from "@slack/web-api"
import { SlackService } from "nestjs-slack-bolt/dist/services/slack.service"

@Injectable()
export class VoteSlackService {
  @Inject()
  private readonly slackService: SlackService

  async getParticipants({
    receiverId,
    senderId,
  }: {
    receiverId: string
    senderId: string
  }): Promise<{
    sender: UsersProfileGetResponse
    receiver: UsersProfileGetResponse
  }> {
    const [receiver, sender] = await Promise.all([
      this.slackService.client.users.profile.get({
        user: receiverId,
      }),
      this.slackService.client.users.profile.get({
        user: senderId,
      }),
    ])

    return {
      sender,
      receiver,
    }
  }

  async respondException(respond: RespondFn, error: unknown) {
    if (error instanceof Error) {
      respond({
        text: error.message,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${error.message}`,
            },
          },
        ],
      })
      return
    }

    respond({
      text: "An unknown error occurred",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "An unknown error occurred",
          },
        },
      ],
    })
  }
}
