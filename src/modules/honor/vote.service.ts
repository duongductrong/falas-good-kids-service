import { Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UsersProfileGetResponse } from "@slack/web-api"
import { Repository } from "typeorm"
import { dayjs } from "@/shared/utils/dayjs"
import { VoteEntity } from "./entities/vote.entity"
import { PersonService } from "./person.service"
import { VoteValidate } from "./vote.validate"

@Injectable()
export class VoteService {
  @Inject()
  private personService: PersonService

  @Inject()
  private voteValidate: VoteValidate

  @InjectRepository(VoteEntity)
  private voteRepository: Repository<VoteEntity>

  async vote(
    sender: UsersProfileGetResponse,
    receiver: UsersProfileGetResponse,
    slackMetadata?: {
      slackChannelId?: string
      slackChannelName?: string
      slackClientMessageId?: string
      slackTeamId?: string
    },
  ) {
    this.voteValidate.throwIfBotOrYourSelf(sender, receiver)

    // Get or create persons for sender and receiver
    const [senderPerson, receiverPerson] = await Promise.all([
      this.personService.findOneOrCreate(sender),
      this.personService.findOneOrCreate(receiver),
    ])

    return this.voteRepository.save({
      ...slackMetadata,
      votedBy: senderPerson,
      votedTo: receiverPerson,
      votedDate: dayjs().toDate(),
      metadata: {},
    })
  }
}
