import { Controller, Get, Inject, Param } from "@nestjs/common"
import { ApiBuilder } from "@/shared/api"
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
}
