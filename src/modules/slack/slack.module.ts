import { Module } from "@nestjs/common"
import { LogLevel } from "@slack/web-api"
import { SlackModule as SlackBoltModule } from "nestjs-slack-bolt"
import { SlackController } from "./slack.controller"

@Module({
  imports: [
    SlackBoltModule.forRoot({
      logLevel: LogLevel.DEBUG,
    }),
  ],
  providers: [],
  controllers: [SlackController],
})
export class SlackModule {}
