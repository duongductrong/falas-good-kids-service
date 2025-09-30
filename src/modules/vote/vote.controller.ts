import { Body, Controller, Get, Inject, Post } from "@nestjs/common"
import { ApiBuilder } from "@/shared/api"
import { CreateAnonymousVoteRequest } from "./dtos/create-vote.dto"
import { VOTE_TOPICS } from "./vote.constant"
import { VoteService } from "./vote.service"

@Controller({
  path: "votes",
})
export class VoteController {
  @Inject()
  private readonly voteService: VoteService

  @Get("topics")
  async getTopics() {
    const topics = await this.voteService.getActiveVoteTopics()
    return ApiBuilder.create()
      .setMessage("Topics fetched successfully")
      .setData(topics)
      .build()
  }

  @Post("topics/seeds")
  async topicSeeds() {
    await this.voteService.createManyTopics(
      VOTE_TOPICS.map((topic) => ({
        text: topic.text,
        value: topic.value,
        active: true,
      })),
    )

    return ApiBuilder.create()
      .setMessage("Topics seeded successfully")
      .setData("ok")
      .build()
  }

  @Post("anonymous")
  async createAnonymousVote(@Body() payload: CreateAnonymousVoteRequest) {
    const result = await this.voteService.voteByAnonymous(payload)
    return ApiBuilder.create()
      .setMessage("Anonymous vote submitted successfully")
      .setData(result)
      .build()
  }
}
