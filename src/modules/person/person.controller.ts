import { Controller, Get, Inject, Param, Query } from "@nestjs/common"
import { ApiBuilder } from "@/shared/api"
import { ParseNumberPipe } from "@/shared/pipe"
import { VoteEntity } from "../vote/entities/vote.entity"
import { GetVotesHistoryRequest } from "./dtos/get-votes-history.dto"
import { PersonService } from "./person.service"

@Controller({
  path: "persons",
})
export class PersonController {
  @Inject()
  private readonly personService: PersonService

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const result = await this.personService.findOne(id)

    return ApiBuilder.create()
      .setData(result)
      .setMessage("Person fetched successfully")
      .build()
  }

  @Get(":id/history-votes")
  async getVotesHistory(
    @Param("id", ParseNumberPipe) id: number,
    @Query() query: GetVotesHistoryRequest,
  ) {
    const result = await this.personService.getVotesHistory(id, {
      page: query.page,
      size: query.size,
      sortOrder: query.sortOrder,
      sortField: query.sortField as keyof VoteEntity,
    })

    return ApiBuilder.create()
      .setData(result)
      .setMessage("Votes history fetched successfully")
      .build()
  }
}
