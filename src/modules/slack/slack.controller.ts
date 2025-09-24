import { Controller } from "@nestjs/common"
import { SlackEventMiddlewareArgs } from "@slack/bolt"
import { Event } from "nestjs-slack-bolt"

@Controller({
  path: "slack",
})
export class SlackController {
  @Event("app_mention")
  app_mention({ say }: SlackEventMiddlewareArgs<"app_mention">) {
    say("Hello there, I'm good kids bot!")
  }
}
