import { IsDefined, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateAnonymousVoteRequest {
  @IsNumber()
  @IsDefined({ message: "Topic ID is required" })
  topicId: number

  @IsNumber()
  @IsDefined({ message: "Receiver ID is required" })
  receiverId: number

  @IsString()
  @IsDefined({ message: "Anonymous ID is required" })
  anonymous: string

  @IsString()
  @IsOptional()
  email?: string

  @IsString()
  @IsDefined({ message: "Message is required" })
  message?: string
}
