import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { ExpressReceiver, App as SlackBoltApp } from "@slack/bolt"

@Injectable()
export class SlackService implements OnModuleInit {
  private readonly logger = new Logger(SlackService.name)

  private slackBoltApp: SlackBoltApp

  private slackBoltReceiver: ExpressReceiver

  constructor() {
    this.slackBoltReceiver = new ExpressReceiver({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
    })

    this.slackBoltApp = new SlackBoltApp({
      token: process.env.SLACK_BOT_TOKEN,
      receiver: this.slackBoltReceiver,
      processBeforeResponse: true,
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
    })
  }

  onModuleInit() {
    this.registerListeners()
  }

  getSlackBoltApp() {
    return this.slackBoltApp
  }

  getSlackBoltReceiver() {
    return this.slackBoltReceiver
  }

  registerListeners(): void {
    this.logger.log("Registering Slack listeners...")

    this.logger.log("Slack listeners registered successfully")
  }
}
