import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PersonEntity } from "./entities/person.entity"
import { VoteEntity } from "./entities/vote.entity"

@Injectable()
export class LoaderboardService {
  @InjectRepository(VoteEntity)
  private voteRepository: Repository<VoteEntity>

  @InjectRepository(PersonEntity)
  private personRepository: Repository<PersonEntity>

  getLeaderboard() {}
}
