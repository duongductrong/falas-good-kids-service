import { Controller, Inject, Post } from "@nestjs/common"
import { VoteService } from "./vote.service"
import { VOTE_TOPICS } from "./vote.constant"
import { ApiBuilder } from "@/shared/api"

@Controller({
  path: "votes",
})
export class VoteController {
  @Inject()
  private readonly voteService: VoteService

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
}
