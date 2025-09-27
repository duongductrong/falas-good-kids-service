import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { UsersProfileGetResponse } from "@slack/web-api"
import { Repository } from "typeorm"
import { PersonEntity } from "./entities/person.entity"

@Injectable()
export class PersonService {
  @InjectRepository(PersonEntity)
  private personRepository: Repository<PersonEntity>

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
}
