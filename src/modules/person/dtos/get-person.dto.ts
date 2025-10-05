import { IsDefined, IsNumberString } from "class-validator"

export class GetPersonRequest {
  @IsNumberString()
  @IsDefined({ message: "Person ID is required" })
  id: string
}
