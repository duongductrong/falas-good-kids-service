import { Controller, Logger } from "@nestjs/common"
import {
  SlackEventMiddlewareArgs,
  SlackShortcut,
  SlackShortcutMiddlewareArgs,
} from "@slack/bolt"
import { Event, Shortcut } from "nestjs-slack-bolt"

@Controller({
  path: "slack",
})
export class SlackController {
  private readonly logger = new Logger(SlackController.name)

  // @Post("events")
  // async handleEvents(@Req() req: Request) {
  //   const resp = pick(req.body, ["challenge"])

  //   console.log(req.body)

  //   return resp
  // }

  @Event("app_mention")
  app_mention({ say }: SlackEventMiddlewareArgs<"app_mention">) {
    console.log("app_mention")
    say("Hello, world!")
  }

  @Event("app_home_opened")
  app_home_opened({ say }: SlackEventMiddlewareArgs<"app_home_opened">) {
    say("The app was just opened!")
  }

  @Shortcut("vote")
  vote({ ack, payload }: SlackShortcutMiddlewareArgs<SlackShortcut>) {
    ack()
    console.log("vote", { payload })
  }
}
