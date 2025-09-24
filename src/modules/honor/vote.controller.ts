import { Controller, Inject } from "@nestjs/common"
import { VoteService } from "./vote.service"

@Controller({
  path: "good-kids/votes",
})
export class VoteController {
  @Inject()
  private readonly voteService: VoteService
}
