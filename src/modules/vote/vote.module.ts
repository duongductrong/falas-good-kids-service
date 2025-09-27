import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PersonModule } from "../person/person.module"
import { VoteTopicEntity } from "./entities/vote-topic.entity"
import { VoteEntity } from "./entities/vote.entity"
import { VoteSlackController } from "./slack/vote.slack.controller"
import { VoteSlackHelper } from "./slack/vote.slack.helper"
import { VoteSlackService } from "./slack/vote.slack.service"
import { VoteSlackValidate } from "./slack/vote.slack.validate"
import { VoteController } from "./vote.controller"
import { VoteService } from "./vote.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([VoteEntity, VoteTopicEntity]),
    forwardRef(() => PersonModule),
  ],
  controllers: [VoteController, VoteSlackController],
  providers: [
    VoteService,
    VoteSlackValidate,
    VoteSlackHelper,
    VoteSlackService,
  ],
  exports: [VoteService, VoteSlackValidate, VoteSlackHelper, VoteSlackService],
})
export class VoteModule {}
