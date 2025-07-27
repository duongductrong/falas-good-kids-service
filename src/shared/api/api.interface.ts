import { HttpStatus } from "@nestjs/common"

export interface ApiMeta {
  page: number
  size: number
  total: number
}

export interface ApiResponse<T, M> {
  status: boolean
  statusCode: HttpStatus
  path: string
  data: T | T[]
  meta?: M
  message: string
  timestamp: string
}

export interface ApiError<T, M = any> extends ApiResponse<T, M> {
  stack?: string
  name?: string
}
