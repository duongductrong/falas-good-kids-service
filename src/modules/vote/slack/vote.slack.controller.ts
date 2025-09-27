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
import { VOTE_TOPICS } from "../vote.constant"
import { VoteService } from "../vote.service"
import {
  VOTE_SLACK_ACTION_ID,
  VOTE_SLACK_SHORTCUT,
} from "./vote.slack.constant"
import { VoteHelper } from "./vote.slack.helper"
import { VoteSlackService } from "./vote.slack.service"
import { VoteSlackValidate } from "./vote.slack.validate"

@Controller({})
export class VoteSlackController {
  @Inject()
  private readonly slackService: SlackService

  @Inject()
  private readonly voteSlackService: VoteSlackService

  @Inject()
  private readonly voteService: VoteService

  @Inject()
  private readonly voteSlackValidate: VoteSlackValidate

  @Inject()
  private readonly voteHelper: VoteHelper

  @Shortcut(VOTE_SLACK_SHORTCUT.VOTE)
  async vote({
    ack,
    payload,
    respond,
  }: SlackShortcutMiddlewareArgs<SlackShortcut>) {
    ack()
    try {
      if (payload.type === "message_action") {
        const receiverId = payload.message.user
        const senderId = payload.user.id

        const { sender, receiver } =
          await this.voteSlackService.getParticipants({ receiverId, senderId })

        this.voteSlackValidate.throwIfBotOrYourSelf(sender, receiver)

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
                  action_id: VOTE_SLACK_ACTION_ID.SUBMIT_ACTION,
                  value: this.voteHelper.submitVote.build({
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
                  action_id: VOTE_SLACK_ACTION_ID.CANCEL_ACTION,
                },
              ],
              block_id: "vote_submission_actions",
            },
          ],
        })
      }
    } catch (error) {
      this.voteSlackService.respondException(respond, error)
    }
  }

  @Action(VOTE_SLACK_ACTION_ID.SUBMIT_ACTION)
  async submitVote({
    ack,
    body,
    payload,
    respond,
  }: SlackActionMiddlewareArgs<BlockAction>) {
    ack()

    const { senderId, receiverId, metadata } =
      this.voteHelper.submitVote.parse(payload)

    const values = body?.state?.values
    const selectedOption =
      values?.vote_type_selection?.vote_type_selection?.selected_option

    const { sender, receiver } = await this.voteSlackService.getParticipants({
      receiverId,
      senderId,
    })

    this.voteSlackValidate.throwIfBotOrYourSelf(sender, receiver)

    await this.voteService.vote(sender, receiver, {
      slackChannelId: metadata.channelId,
      slackChannelName: metadata.channelName,
      slackClientMessageId: metadata.clientMessageId,
      slackTeamId: metadata.teamId,
    })

    respond({
      text: `Vote successfully submitted! 🎉`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🎉 *Vote Successfully Submitted!*\n\nYou voted for *${receiver.profile?.display_name || receiver.profile?.real_name}* in the "${selectedOption?.text?.text}" category.\n\nThank you for participating in recognizing your teammates! 🌟`,
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

  @Action(VOTE_SLACK_ACTION_ID.CANCEL_ACTION)
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
