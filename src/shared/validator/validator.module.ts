import { Module } from "@nestjs/common"
import { IsExistsConstraint } from "./is-exists.constraint"
import { SameAsConstraint } from "./same-as.constraint"
import { IsUniqueConstraint } from "./unique.constraint"

@Module({
  imports: [],
  exports: [],
  providers: [IsUniqueConstraint, SameAsConstraint, IsExistsConstraint],
})
export class ValidatorModule {}
