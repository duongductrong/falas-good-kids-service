import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { UserService } from "src/modules/user/user.service"
import { AuthTokenPayload } from "../classes/auth-token-payload"
import { jwtConstants } from "../jwt.constants"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    })
  }

  async validate(payload: AuthTokenPayload) {
    const user = await this.userService.findUserByEmail(payload.email, {
      where: {
        isActive: true,
      },
    })

    if (!user) {
      throw new UnauthorizedException("Invalid token")
    }
    return user
  }
}
