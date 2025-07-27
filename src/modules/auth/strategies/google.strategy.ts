import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy } from "passport-google-oauth20"
import { UserService } from "@/modules/user/user.service"
import { GoogleUser } from "../decorators/current-user.decorator"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private userService: UserService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["email", "profile", "openid"],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<GoogleUser> {
    return {
      provider: "google",
      profile: profile as Profile,
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken,
    }
  }
}
