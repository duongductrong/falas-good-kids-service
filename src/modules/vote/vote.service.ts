import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import {
  UsersLookupByEmailResponse,
  UsersProfileGetResponse,
} from "@slack/web-api"
import { SlackService } from "nestjs-slack-bolt/dist/services/slack.service"
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

  @Inject()
  private readonly slackService: SlackService

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
    topic: VoteTopicEntity,
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
      topic,
      votedBy: senderPerson,
      votedFor: receiverPerson,
      votedDate: dayjs().toDate(),
      metadata: {},
    })
  }

  async voteByAnonymous(payload: CreateAnonymousVoteRequest) {
    try {
      const { topicId, receiverId, message, email } = payload

      const [receiver, topic, slackUser] = await Promise.all([
        this.personService.findOne(receiverId),
        this.voteTopicRepository.findOne({
          where: { id: Number(topicId) },
        }),
        this.slackService.client.users
          .lookupByEmail({
            email,
          })
          .catch(() => null) as Promise<UsersLookupByEmailResponse | null>,
      ])

      if (!receiver) {
        throw new BadRequestException("Receiver or topic not found")
      }

      if (!topic) {
        throw new BadRequestException("Topic not found")
      }

      if (!slackUser) {
        throw new BadRequestException(
          "The email is not a valid user of this workspace.",
        )
      }

      if (slackUser.user.profile.email === receiver.email) {
        throw new BadRequestException("You can't vote for yourself")
      }

      const voted = await this.voteRepository.save({
        votedFor: receiver,
        votedDate: dayjs().toDate(),
        slackUserId: slackUser.user.id,
        slackUserEmail: slackUser.user.profile.email,
        slackUserName: slackUser.user.profile.real_name,
        metadata: {},
        topic,
        message,
      })

      return voted
    } catch (error) {
      this.logger.error(error)

      let msg = "Vote by anonymous failed, please try again"

      if (error instanceof BadRequestException) {
        msg = error.message
      }

      throw new BadRequestException(msg)
    }
  }

  async getActiveVoteTopics() {
    return this.voteTopicRepository.find({ where: { active: true } })
  }

  async createManyTopics(topics: Partial<VoteTopicEntity>[]) {
    return this.voteTopicRepository.save(topics)
  }

  async getTopic(value: number | string) {
    if (typeof value === "number") {
      return this.voteTopicRepository.findOne({
        where: { id: value, active: true },
      })
    }

    return this.voteTopicRepository.findOne({
      where: { value, active: true },
    })
  }
}
