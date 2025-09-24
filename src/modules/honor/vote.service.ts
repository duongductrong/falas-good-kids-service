import { BadRequestException, Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UsersProfileGetResponse } from "@slack/web-api"
import { has } from "lodash"
import { Repository } from "typeorm"
import { dayjs } from "@/shared/utils/dayjs"
import { VoteEntity } from "./entities/vote.entity"
import { PersonService } from "./person.service"

@Injectable()
export class VoteService {
  @Inject()
  private personService: PersonService

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
    const isVotedForBot =
      has(sender.profile, "bot_id") || has(receiver.profile, "bot_id")
    const isVotedForYourSelf = sender.profile?.email === receiver.profile?.email

    if (isVotedForBot || isVotedForYourSelf) {
      throw new BadRequestException("You can't vote for a bot or yourself")
    }

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
