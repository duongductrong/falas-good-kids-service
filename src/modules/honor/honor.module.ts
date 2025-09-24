import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HonorController } from "./honor.controller"
import { PersonEntity } from "./entities/person.entity"
import { VoteEntity } from "./entities/vote.entity"
import { PersonController } from "./person.controller"
import { VoteController } from "./vote.controller"
import { PersonService } from "./person.service"
import { VoteService } from "./vote.service"

@Module({
  imports: [TypeOrmModule.forFeature([PersonEntity, VoteEntity])],
  providers: [PersonService, VoteService],
  controllers: [HonorController, PersonController, VoteController],
})
export class HonorModule {}
