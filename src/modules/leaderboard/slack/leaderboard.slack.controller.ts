import { Controller, Inject } from "@nestjs/common"
import { SlackCommandMiddlewareArgs } from "@slack/bolt"
import { Command } from "nestjs-slack-bolt"
import { LeaderboardService } from "../leaderboard.service"
import { LeaderboardRange, LeaderboardSortOrder } from "../leaderboard.enum"

@Controller()
export class LeaderboardSlackController {
  @Inject()
  private readonly leaderboardService: LeaderboardService

  @Command("/leaderboard")
  async leaderboard(context: SlackCommandMiddlewareArgs) {
    await context.ack()

    const board = await this.leaderboardService.getLeaderboard({
      range: LeaderboardRange.ALL_TIME,
      sortOrder: LeaderboardSortOrder.DESC,
    })

    const topThreeEmojis = ["🥇", "🥈", "🥉"]

    return context.respond({
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🏆 Leaderboard 🏆",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `✨ *${board.length}* amazing people are competing! ✨`,
          },
        },
        ...board.slice(0, 3).map((item, index) => ({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${topThreeEmojis[index]} *${item.realName}*\n💎 *${item.scores}* votes`,
          },
        })),
        ...(board.length > 3
          ? [
              {
                type: "divider",
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: board
                    .slice(3)
                    .map(
                      (item, index) =>
                        `${index + 4}. *${item.realName}* - ${item.scores} votes`,
                    )
                    .join("\n"),
                },
              },
            ]
          : []),
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "🎯 Keep voting to climb the ranks! | 📊 Updated in real-time",
            },
          ],
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
}
