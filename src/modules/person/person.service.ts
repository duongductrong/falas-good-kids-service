import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UsersProfileGetResponse } from "@slack/web-api"
import { Repository } from "typeorm"
import { dayjs } from "@/shared/utils/dayjs"
import { VoteEntity } from "../vote/entities/vote.entity"
import { PersonEntity } from "./entities/person.entity"

@Injectable()
export class PersonService {
  @InjectRepository(PersonEntity)
  private readonly personRepository: Repository<PersonEntity>

  @InjectRepository(VoteEntity)
  private readonly voteRepository: Repository<VoteEntity>

  async createPerson(
    person: Omit<PersonEntity, "id" | "createdAt" | "updatedAt" | "deletedAt">,
  ) {
    return this.personRepository.save(person)
  }

  async getPersonByEmail(email: string) {
    return this.personRepository.findOne({ where: { email } })
  }

  async findOneOrCreate(sender: UsersProfileGetResponse) {
    let person = await this.personRepository.findOne({
      where: { email: sender.profile?.email },
    })

    if (!person) {
      person = await this.personRepository.save({
        email: sender.profile?.email,
        realName: sender.profile?.real_name,
        avatar: sender.profile?.image_72,
      })
    }

    return person
  }

  async findOne(identify: string | number) {
    const currentPeriod = dayjs(dayjs(), "Asia/Ho_Chi_Minh")

    const result = await this.personRepository.findOne({
      where:
        typeof identify === "number" || !Number.isNaN(Number(identify))
          ? { id: Number(identify) }
          : { email: String(identify) },
    })

    if (!result) {
      throw new NotFoundException("Person not found")
    }

    const monthly = this.voteRepository
      .createQueryBuilder("vm")
      .select("TO_CHAR(DATE_TRUNC('month', vm.voted_date), 'MM.YYYY')", "month")
      .addSelect("vm.voted_for_id", "voted_for_id")
      .addSelect("COUNT(vm.id)", "total_votes")
      .groupBy("vm.voted_date, vm.voted_for_id")

    const rankingSubQuery = this.voteRepository
      .createQueryBuilder()
      .select("m.month", "month")
      .addSelect("m.voted_for_id", "voted_for_id")
      .addSelect("m.total_votes", "total_votes")
      .addSelect(
        `CAST(
          RANK() OVER (
            PARTITION BY m.month
            ORDER BY m.total_votes DESC, m.voted_for_id ASC  
          ) as INT
        )`,
        "rank",
      )
      .from(`(${monthly.getQuery()})`, "m")
      .setParameters(monthly.getParameters())
      .groupBy("m.month, m.voted_for_id, m.total_votes")

    const ranking = await this.voteRepository
      .createQueryBuilder("vote")
      .select("ranking.month", "month")
      .addSelect("ranking.voted_for_id", "voted_for_id")
      .addSelect("ranking.total_votes", "total_votes")
      .addSelect("ranking.rank", "ranked")
      .from(`(${rankingSubQuery.getQuery()})`, "ranking")
      .setParameters(rankingSubQuery.getParameters())
      .where("vote.voted_date BETWEEN :startDate AND :endDate", {
        startDate: currentPeriod.startOf("month").toDate(),
        endDate: currentPeriod.endOf("month").toDate(),
      })
      .andWhere("ranking.voted_for_id = :id", { id: result.id })
      .groupBy(
        "ranking.month, ranking.voted_for_id, ranking.total_votes, ranking.rank",
      )
      .getRawOne()

    return { ...result, rank: ranking?.ranked || "N/A" }
  }

  async findAll() {
    return this.personRepository.find({})
  }

  async getVotesHistory(
    personId: number,
    options?: {
      page?: number
      size?: number
      sortOrder?: "DESC" | "ASC"
      sortField?: keyof VoteEntity
    },
  ) {
    const {
      page = 0,
      size = 10,
      sortOrder = "DESC",
      sortField = "createdAt",
    } = options

    const person = await this.personRepository.findOne({
      where: { id: personId },
    })

    if (!person) {
      throw new NotFoundException("Person not found")
    }

    const result = await this.voteRepository.find({
      skip: page * size,
      take: size,
      relations: { topic: true, votedBy: true, votedFor: true },
      where: [
        {
          votedBy: {
            id: person.id,
          },
        },
        {
          votedFor: {
            id: person.id,
          },
        },
      ],
      order: {
        [sortField]: sortOrder,
      },
      select: {
        id: true,
        createdAt: true,
        deletedAt: true,
        updatedAt: true,
        votedDate: true,
        votedBy: {
          avatar: true,
          realName: true,
          email: true,
          id: true,
        },
        votedFor: {
          avatar: true,
          realName: true,
          email: true,
          id: true,
        },
        topic: {
          id: true,
          active: true,
          value: true,
          text: true,
        },
        message: true,
      },
    })

    return result
  }
}
