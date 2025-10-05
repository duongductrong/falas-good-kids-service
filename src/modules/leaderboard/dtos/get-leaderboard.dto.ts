import { IsEnum, IsNumber, IsOptional } from "class-validator"
import { LeaderboardRange, LeaderboardSortOrder } from "../leaderboard.enum"

export class GetLeaderboardRequest {
  @IsEnum(LeaderboardRange)
  @IsOptional()
  range: LeaderboardRange

  @IsEnum(LeaderboardSortOrder)
  @IsOptional()
  sortOrder: LeaderboardSortOrder = LeaderboardSortOrder.DESC

  @IsNumber()
  @IsOptional()
  size?: number

  @IsNumber()
  @IsOptional()
  topicId?: number
}
