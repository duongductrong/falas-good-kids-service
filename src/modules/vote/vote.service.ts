import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UsersProfileGetResponse } from "@slack/web-api"
import { Repository } from "typeorm"
import { dayjs } from "@/shared/utils/dayjs"
import { PersonService } from "../person/person.service"
import { CreateAnonymousVoteRequest } from "./dtos/create-vote.dto"
import { VoteTopicEntity } from "./entities/vote-topic.entity"
import { VoteEntity } from "./entities/vote.entity"
import { VoteSlackValidate } from "./slack/vote.slack.validate"

@Injectable()
export class VoteService {
  private readonly logger: Logger = new Logger(VoteService.name)

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
      votedFor: receiverPerson,
      votedDate: dayjs().toDate(),
      metadata: {},
    })
  }

  async voteByAnonymous(payload: CreateAnonymousVoteRequest) {
    try {
      const { topicId, receiverId, anonymous, message } = payload

      const [receiver, topic] = await Promise.all([
        this.personService.findOne(receiverId),
        this.voteTopicRepository.findOne({
          where: { id: Number(topicId) },
        }),
      ])

      if (!receiver) {
        throw new BadRequestException("Receiver or topic not found")
      }

      if (!topic) {
        throw new BadRequestException("Topic not found")
      }

      const voted = await this.voteRepository.save({
        votedFor: receiver,
        votedByAnonymous: anonymous,
        votedDate: dayjs().toDate(),
        metadata: {},
        topic,
        message,
      })

      return voted
    } catch (error) {
      this.logger.error(error)
      throw new BadRequestException(
        "Vote by anonymous failed, please try again",
      )
    }
  }

  async getActiveVoteTopics() {
    return this.voteTopicRepository.find({ where: { active: true } })
  }

  async createManyTopics(topics: Partial<VoteTopicEntity>[]) {
    return this.voteTopicRepository.save(topics)
  }
}
