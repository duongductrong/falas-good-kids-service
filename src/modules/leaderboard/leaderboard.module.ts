import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PersonEntity } from "../person/entities/person.entity"
import { VoteEntity } from "../vote/entities/vote.entity"
import { LeaderboardController } from "./leaderboard.controller"
import { LeaderboardService } from "./leaderboard.service"
import { LeaderboardSlackController } from "./slack/leaderboard.slack.controller"
import { LeaderboardSlackService } from "./slack/leaderboard.slack.service"

@Module({
  imports: [TypeOrmModule.forFeature([VoteEntity, PersonEntity])],
  controllers: [LeaderboardController, LeaderboardSlackController],
  providers: [LeaderboardService, LeaderboardSlackService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
