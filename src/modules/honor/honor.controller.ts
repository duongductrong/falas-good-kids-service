import { Controller, Inject } from "@nestjs/common"
import {
  BlockAction,
  SlackAction,
  SlackActionMiddlewareArgs,
  SlackShortcut,
  SlackShortcutMiddlewareArgs,
} from "@slack/bolt"
import { Action, Shortcut } from "nestjs-slack-bolt"
import { SlackService } from "nestjs-slack-bolt/dist/services/slack.service"
import { HonorHelper } from "./honor.helper"
import { VOTE_TOPICS } from "./vote.constant"
import { VoteService } from "./vote.service"
import { VoteValidate } from "./vote.validate"

// Interface to type the payload state for vote submission

@Controller({
  path: "honor",
})
export class HonorController {
  @Inject()
  private readonly slackService: SlackService

  @Inject()
  private readonly voteService: VoteService

  @Inject()
  private readonly honorHelper: HonorHelper

  @Inject()
  private readonly voteValidate: VoteValidate

  @Shortcut("vote")
  async vote({
    ack,
    payload,
    respond,
  }: SlackShortcutMiddlewareArgs<SlackShortcut>) {
    ack()
    if (payload.type === "message_action") {
      try {
        const receiverId = payload.message.user
        const senderId = payload.user.id

        const [receiver, sender] = await Promise.all([
          this.slackService.client.users.profile.get({
            user: receiverId,
          }),
          this.slackService.client.users.profile.get({
            user: senderId,
          }),
        ])

        this.voteValidate.throwIfBotOrYourSelf(sender, receiver)

        respond({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `🗳️ You are voting for <@${receiver.profile?.real_name || payload.message.user}>!\n\nPlease select the type of recognition you'd like to give:`,
              },
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "Choose one option:",
              },
              accessory: {
                type: "radio_buttons",
                options: VOTE_TOPICS.map((voteTopic) => ({
                  text: {
                    type: "plain_text",
                    text: voteTopic.text,
                  },
                  value: voteTopic.value,
                })),
                action_id: "vote_type_selection",
              },
              block_id: "vote_type_selection",
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "Submit Vote",
                  },
                  style: "primary",
                  action_id: "submit_vote",
                  value: this.honorHelper.submitVote.build({
                    receiverId,
                    senderId,
                    channelId: payload.channel.id,
                    channelName: payload.channel.name,
                    clientMessageId: payload.message.client_msg_id,
                    teamId: payload.team.id,
                  }),
                },
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "Cancel Vote",
                  },
                  style: "danger",
                  action_id: "cancel_vote",
                },
              ],
              block_id: "vote_submission_actions",
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

  @Action("submit_vote")
  async submitVote({
    ack,
    body,
    payload,
    respond,
  }: SlackActionMiddlewareArgs<BlockAction>) {
    ack()

    const { senderId, receiverId, metadata } =
      this.honorHelper.submitVote.parse(payload)

    const values = body?.state?.values
    const selectedOption =
      values?.vote_type_selection?.vote_type_selection?.selected_option

    const [sender, receiver] = await Promise.all([
      this.slackService.client.users.profile.get({
        user: senderId,
      }),
      this.slackService.client.users.profile.get({
        user: receiverId,
      }),
    ])

    await this.voteService.vote(sender, receiver, {
      slackChannelId: metadata.channelId,
      slackChannelName: metadata.channelName,
      slackClientMessageId: metadata.clientMessageId,
      slackTeamId: metadata.teamId,
    })

    respond({
      text: `Vote submitted for ${selectedOption.text.text}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `✅ Vote submitted for "${selectedOption.text.text}".`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View Leaderboard",
              },
              url: "https://falas-good-kids.vercel.app",
            },
          ],
        },
      ],
    })
  }

  @Action("cancel_vote")
  async cancelVote({ ack, respond }: SlackActionMiddlewareArgs<SlackAction>) {
    ack()

    // Respond with cancellation message
    respond({
      text: "Vote cancelled.",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "❌ Vote cancelled. No vote was recorded.",
          },
        },
      ],
    })
  }
}
