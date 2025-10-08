import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator"

export enum GetVotesHistorySortOrder {
  DESC = "DESC",
  ASC = "ASC",
}

export class GetVotesHistoryRequest {
  @IsNumber()
  @IsOptional()
  page?: number

  @IsNumber()
  @IsOptional()
  size?: number

  @IsEnum(GetVotesHistorySortOrder)
  @IsOptional()
  sortOrder?: GetVotesHistorySortOrder

  @IsString()
  @IsOptional()
  sortField?: string
}
