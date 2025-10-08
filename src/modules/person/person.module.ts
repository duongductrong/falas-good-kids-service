import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { VoteEntity } from "../vote/entities/vote.entity"
import { VoteModule } from "../vote/vote.module"
import { PersonEntity } from "./entities/person.entity"
import { PersonController } from "./person.controller"
import { PersonService } from "./person.service"

@Module({
  imports: [
    TypeOrmModule.forFeature([PersonEntity, VoteEntity]),
    forwardRef(() => VoteModule),
  ],
  providers: [PersonService],
  controllers: [PersonController],
  exports: [PersonService],
})
export class PersonModule {}
