import { IsNumber } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { ApiMeta } from "../api.interface"

export function ApiMetaDto() {
  class InnerApiMeta implements ApiMeta {
    @IsNumber()
    @ApiProperty()
    page: number

    @IsNumber()
    @ApiProperty()
    size: number

    @IsNumber()
    @ApiProperty()
    total: number
  }

  return InnerApiMeta
}
