import { Controller, Inject } from "@nestjs/common"
import { PersonService } from "./person.service"

@Controller({
  path: "good-kids/persons",
})
export class PersonController {
  @Inject()
  private readonly personService: PersonService
}
