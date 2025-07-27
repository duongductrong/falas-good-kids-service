import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy } from "passport-local"
import { AuthService } from "../auth.service"

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  @Inject()
  private readonly authService: AuthService

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.verifyUser(username, password)
    if (!user) {
      throw new NotFoundException("We could not find any user with that email")
    }
    return user
  }
}
