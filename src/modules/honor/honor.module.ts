import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HonorController } from "./honor.controller"
import { PersonEntity } from "./entities/person.entity"
import { VoteEntity } from "./entities/vote.entity"
import { PersonController } from "./person.controller"
import { VoteController } from "./vote.controller"
import { PersonService } from "./person.service"
import { VoteService } from "./vote.service"
import { HonorHelper } from "./honor.helper"
import { VoteValidate } from "./vote.validate"

@Module({
  imports: [TypeOrmModule.forFeature([PersonEntity, VoteEntity])],
  providers: [PersonService, VoteService, HonorHelper, VoteValidate],
  controllers: [HonorController, PersonController, VoteController],
  exports: [HonorHelper, VoteValidate],
})
export class HonorModule {}
