import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UsersProfileGetResponse } from "@slack/web-api"
import { Repository } from "typeorm"
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
    if (typeof identify === "number" || !Number.isNaN(Number(identify))) {
      const result = await this.personRepository.findOne({
        where: { id: Number(identify) },
      })

      if (!result) {
        throw new NotFoundException("Person not found")
      }

      const rank = 1

      return { ...result, rank }
    }

    const result = await this.personRepository.findOne({
      where: { email: String(identify) },
    })

    if (!result) {
      throw new NotFoundException("Person not found")
    }

    const rank = 1

    return { ...result, rank }
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
      sortField = "votedDate",
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
      },
    })

    return result
  }
}
