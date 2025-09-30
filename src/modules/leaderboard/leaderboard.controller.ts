import { Controller, Get, Inject, Query } from "@nestjs/common"
import { ApiBuilder } from "@/shared/api"
import { GetLeaderboardRequest } from "./dtos/get-leaderboard.dto"
import { LeaderboardService } from "./leaderboard.service"

@Controller({
  path: "leaderboard",
})
export class LeaderboardController {
  @Inject()
  private readonly leaderboardService: LeaderboardService

  @Get()
  async getLeaderboard(@Query() body: GetLeaderboardRequest) {
    const leaderboard = await this.leaderboardService.getLeaderboard(body)
    return ApiBuilder.create()
      .setMessage("Leaderboard fetched successfully")
      .setData(leaderboard)
      .build()
  }
}
