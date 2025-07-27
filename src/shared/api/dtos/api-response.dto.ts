import { HttpStatus } from "@nestjs/common"
import { ApiProperty } from "@nestjs/swagger"
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator"
import { ApiResponse } from "../api.interface"

export function ApiResponseDto<T, M>(_resultCls?: any | any[], _metaCls?: any) {
  class InnerApiResponseDto implements ApiResponse<T, M> {
    @IsBoolean()
    @ApiProperty()
    status: boolean

    @IsEnum(HttpStatus)
    @ApiProperty()
    statusCode: HttpStatus

    @IsString()
    @ApiProperty()
    path: string

    @ApiProperty({ type: _resultCls })
    data: T | T[]

    @IsObject()
    @IsOptional()
    @ApiProperty({ type: _metaCls })
    meta?: M

    @IsString()
    @ApiProperty()
    message: string

    @IsString()
    @ApiProperty()
    timestamp: string

    constructor({
      message,
      meta,
      path,
      data,
      status,
      statusCode,
      timestamp,
    }: ApiResponse<T, M>) {
      this.statusCode = statusCode
      this.message = message
      this.data = data
      this.status = status
      this.timestamp = timestamp
      this.path = path
      this.meta = meta
    }
  }

  return InnerApiResponseDto
}
