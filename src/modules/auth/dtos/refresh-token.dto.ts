import { IsString } from "class-validator"

export class RefreshTokenRequest {
  @IsString({ message: "Refresh token is required" })
  refreshToken: string
}
