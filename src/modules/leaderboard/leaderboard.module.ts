import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { PersonEntity } from "../person/entities/person.entity"
import { VoteEntity } from "../vote/entities/vote.entity"
import { LeaderboardController } from "./leaderboard.controller"
import { LeaderboardService } from "./leaderboard.service"

@Module({
  imports: [TypeOrmModule.forFeature([VoteEntity, PersonEntity])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
