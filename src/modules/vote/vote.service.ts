import { Inject, Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UsersProfileGetResponse } from "@slack/web-api"
import { Repository } from "typeorm"
import { dayjs } from "@/shared/utils/dayjs"
import { PersonService } from "../person/person.service"
import { VoteTopicEntity } from "./entities/vote-topic.entity"
import { VoteEntity } from "./entities/vote.entity"
import { VoteSlackValidate } from "./slack/vote.slack.validate"

@Injectable()
export class VoteService {
  @InjectRepository(VoteEntity)
  private voteRepository: Repository<VoteEntity>

  @InjectRepository(VoteTopicEntity)
  private voteTopicRepository: Repository<VoteTopicEntity>

  @Inject()
  private personService: PersonService

  @Inject()
  private voteSlackValidate: VoteSlackValidate

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
    this.voteSlackValidate.throwIfBotOrYourSelf(sender, receiver)

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

  async getActiveVoteTopics() {
    return this.voteTopicRepository.find({ where: { active: true } })
  }

  async createManyTopics(topics: Partial<VoteTopicEntity>[]) {
    return this.voteTopicRepository.save(topics)
  }
}
