import { IsEnum, IsOptional } from "class-validator"
import { LeaderboardRange } from "../leaderboard.enum"

export class GetLeaderboardRequest {
  @IsEnum(LeaderboardRange)
  @IsOptional()
  range: LeaderboardRange
}
