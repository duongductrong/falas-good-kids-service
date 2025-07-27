import { createParamDecorator, ExecutionContext } from "@nestjs/common"
import { Profile } from "passport-google-oauth20"
import { UserEntity } from "@/modules/user/entities/user.entity"

export type User = UserEntity
export type GoogleUser = {
  profile: Profile
  googleAccessToken: string
  googleRefreshToken?: string
  provider: "google"
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request?.user ?? null
    return user
  },
)
