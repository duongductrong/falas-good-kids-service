import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { Request } from "express"

export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    const token = request.headers.authorization?.split(" ")[1] || null
    return token
  },
)

export const RefreshToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    const refreshToken = request?.body?.refreshToken || null

    return refreshToken
  },
)
