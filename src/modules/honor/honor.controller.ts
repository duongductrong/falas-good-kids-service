import { Controller, Inject } from "@nestjs/common"
import {
  SlackEventMiddlewareArgs,
  SlackShortcut,
  SlackShortcutMiddlewareArgs,
} from "@slack/bolt"
import { Event, Shortcut } from "nestjs-slack-bolt"
import { SlackService } from "nestjs-slack-bolt/dist/services/slack.service"
import { VoteService } from "./vote.service"

@Controller({
  path: "honor",
})
export class HonorController {
  @Inject()
  private readonly slackService: SlackService

  @Inject()
  private readonly voteService: VoteService

  @Shortcut("vote")
  async vote({
    ack,
    payload,
    respond,
  }: SlackShortcutMiddlewareArgs<SlackShortcut>) {
    ack()
    if (payload.type === "message_action") {
      try {
        const [receiver, sender] = await Promise.all([
          this.slackService.client.users.profile.get({
            user: payload.message.user,
          }),
          this.slackService.client.users.profile.get({
            user: payload.user.id,
          }),
        ])

        await this.voteService.vote(sender, receiver, {
          slackChannelId: payload.channel.id,
          slackChannelName: payload.channel.name,
          slackClientMessageId: payload.message.client_msg_id,
          slackTeamId: payload.team.id,
        })

        respond({
          text: "Vote recorded successfully! The leaderboard has been updated.",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "✅ Vote recorded successfully! The leaderboard has been updated.",
              },
            },
          ],
        })
      } catch (error: unknown) {
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
  }

  @Event("reaction_added")
  async reactionAdded({ payload }: SlackEventMiddlewareArgs<"reaction_added">) {
    const reaction = await this.slackService.client.reactions.get({
      channel: payload.item.channel,
      timestamp: payload.item.ts,
    })

    console.log(reaction)

    // say(`Hello world ${payload?.reaction}`)
  }
}
