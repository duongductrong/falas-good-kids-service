import { IsDefined, IsNumber, IsString } from "class-validator"

export class CreateAnonymousVoteRequest {
  @IsNumber()
  @IsDefined({ message: "Topic ID is required" })
  topicId: number

  @IsNumber()
  @IsDefined({ message: "Receiver ID is required" })
  receiverId: number

  @IsString()
  @IsDefined({
    message: "Email is required, please enter your enterprise email",
  })
  email: string

  @IsString()
  @IsDefined({ message: "Message is required" })
  message?: string
}
