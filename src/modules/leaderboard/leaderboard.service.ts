import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { isNil } from "lodash"
import { Repository } from "typeorm"
import { VoteEntity } from "@/modules/vote/entities/vote.entity"
import { PersonEntity } from "@/modules/person/entities/person.entity"
import { GetLeaderboardRequest } from "./dtos/get-leaderboard.dto"
import { getLeaderboardRange } from "./leaderboard.helper"

@Injectable()
export class LeaderboardService {
  @InjectRepository(VoteEntity)
  private voteRepository: Repository<VoteEntity>

  @InjectRepository(PersonEntity)
  private personRepository: Repository<PersonEntity>

  getLeaderboard(body: GetLeaderboardRequest) {
    const { range, sortOrder, size } = body

    const leaderboardRange = getLeaderboardRange(range)

    let rootQuery = this.personRepository
      .createQueryBuilder("person")
      .leftJoin(VoteEntity, "vote", "vote.voted_for_id = person.id")
      .leftJoin(PersonEntity, "voter", "voter.id = vote.voted_by_id")
      .groupBy("person.id, vote.voted_for_id")
      .orderBy("COUNT(vote.id)", sortOrder.toString() as "ASC" | "DESC")

    if (leaderboardRange) {
      const [startDate, endDate] = leaderboardRange
      rootQuery = rootQuery.andWhere(
        "vote.voted_date BETWEEN :startDate AND :endDate",
        {
          startDate,
          endDate,
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

    if (!isNil(size)) {
      rootQuery = rootQuery.limit(size)
    }

    return rootQuery.getRawMany()
  }
}
