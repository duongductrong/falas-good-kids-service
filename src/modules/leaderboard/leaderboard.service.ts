import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { isNil } from "lodash"
import { Repository } from "typeorm"
import { dayjs } from "@/shared/utils/dayjs"
import { VoteEntity } from "@/modules/vote/entities/vote.entity"
import { PersonEntity } from "@/modules/person/entities/person.entity"
import { GetLeaderboardRequest } from "./dtos/get-leaderboard.dto"

@Injectable()
export class LeaderboardService {
  @InjectRepository(VoteEntity)
  private voteRepository: Repository<VoteEntity>

  @InjectRepository(PersonEntity)
  private personRepository: Repository<PersonEntity>

  getLeaderboard(body: GetLeaderboardRequest) {
    const { sortOrder, size, topicId, duration } = body

    let rootQuery = this.personRepository
      .createQueryBuilder("person")
      .leftJoin(VoteEntity, "vote", "vote.voted_for_id = person.id")
      .leftJoin(PersonEntity, "voter", "voter.id = vote.voted_by_id")
      .groupBy("person.id, vote.voted_for_id")
      .orderBy("COUNT(vote.id)", sortOrder.toString() as "ASC" | "DESC")

    if (topicId) {
      rootQuery = rootQuery.andWhere("vote.topic_id = :topicId", { topicId })
    }

    if (!isNil(size)) {
      rootQuery = rootQuery.limit(size)
    }

    if (!isNil(duration)) {
      const durationParsed = dayjs.tz(
        `01.${duration}`,
        "DD.MM.YYYY",
        "Asia/Ho_Chi_Minh",
      )

      rootQuery = rootQuery.andWhere(
        "vote.voted_date BETWEEN :startDate AND :endDate",
        {
          startDate: durationParsed.startOf("month").toDate(),
          endDate: durationParsed.endOf("month").toDate(),
        },
      )
    }

    rootQuery = rootQuery
      .select("person.id", "id")
      .addSelect("person.realName", "realName")
      .addSelect("person.avatar", "avatar")
      .addSelect("person.email", "email")
      .addSelect("CAST(COUNT(vote.id) AS INTEGER)", "scores")
      .addSelect((db) => {
        return db
          .subQuery()
          .select(
            `COALESCE(
              json_agg(
                DISTINCT jsonb_build_object(
                  'id', voter.id,
                  'realName', voter."real_name",
                  'avatar', voter."avatar"
                )
              ),
              '[]'
            )`,
          )
          .from(VoteEntity, "vote")
          .innerJoin(PersonEntity, "voter", "voter.id = vote.voted_by_id")
          .where(
            "voter.id = vote.voted_by_id AND vote.voted_for_id != voter.id",
          )
          .where("vote.voted_for_id = person.id")
          .limit(5)
      }, "voters")

    return rootQuery.getRawMany()
  }

  async getLeaderboardRange() {
    const [[oldestVote], [newestVote]] = await Promise.all([
      this.voteRepository.find({
        order: {
          createdAt: "ASC",
        },
        take: 1,
      }),
      this.voteRepository.find({
        order: {
          createdAt: "DESC",
        },
        take: 1,
      }),
    ])

    if (!oldestVote || !newestVote) {
      return {
        from: [dayjs().get("month") + 1, dayjs().get("year")],
        to: [dayjs().get("month") + 1, dayjs().get("year")],
        range: [dayjs().startOf("month").unix(), dayjs().endOf("month").unix()],
      }
    }

    const oldestVoteDayjs = dayjs(oldestVote.createdAt).tz("Asia/Ho_Chi_Minh")
    const newestVoteDayjs = dayjs(newestVote.createdAt).tz("Asia/Ho_Chi_Minh")

    return {
      from: [oldestVoteDayjs.get("month") + 1, oldestVoteDayjs.get("year")],
      to: [newestVoteDayjs.get("month") + 1, newestVoteDayjs.get("year")],
      range: [
        oldestVoteDayjs.startOf("month").unix(),
        newestVoteDayjs.endOf("month").unix(),
      ],
    }
  }

  async getRankingTrend(personId: number) {
    const person = await this.personRepository.findOne({
      where: {
        id: personId,
      },
    })

    if (!person) {
      throw new NotFoundException("Person not found")
    }

    const result = await this.voteRepository
      .createQueryBuilder("vote")
      .select(
        "TO_CHAR(DATE_TRUNC('month', vote.voted_date), 'MM.YYYY') as month",
      )
      .addSelect(
        `CAST(
          RANK() OVER (
            PARTITION BY TO_CHAR(DATE_TRUNC('month' ,vote.voted_date), 'MM.YYYY') ORDER BY COUNT(vote.id) ASC
          ) AS INT
        )`,
        "ranked",
      )
      .addSelect("CAST(COUNT(vote.voted_for_id) as INT)", "totalVotes")
      .where("voted_for_id = :id", { id: personId })
      .andWhere("vote.voted_date BETWEEN :startDate AND :endDate", {
        startDate: dayjs().startOf("year").toDate(),
        endDate: dayjs().endOf("year").toDate(),
      })
      .groupBy(
        "TO_CHAR(DATE_TRUNC('month', vote.voted_date), 'MM.YYYY'), vote.voted_for_id",
      )
      .getRawMany()

    return result
  }
}
