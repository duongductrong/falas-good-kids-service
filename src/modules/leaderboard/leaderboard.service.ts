import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
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
    const { range } = body

    const leaderboardRange = getLeaderboardRange(range)

    let rootQuery = this.personRepository
      .createQueryBuilder("person")
      .leftJoin(VoteEntity, "vote", "vote.voted_for_id = person.id")
      .groupBy("person.id, vote.voted_for_id")
      .orderBy("COUNT(vote.id)", "DESC")

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
      .addSelect("CAST(COUNT(vote.id) AS INTEGER)", "scores")
      .setParameters(
        this.voteRepository.createQueryBuilder("vote").getParameters(),
      )

    return rootQuery.getRawMany()
  }
}
