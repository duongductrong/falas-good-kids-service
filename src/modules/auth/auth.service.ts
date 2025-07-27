import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcryptjs"
import { Profile } from "passport-google-oauth20"
import { UserEntity } from "../user/entities/user.entity"
import { UserRole } from "../user/user.constant"
import { UserService } from "../user/user.service"
import { AuthTokenPayload } from "./classes/auth-token-payload"
import { SignUpRequest } from "./dtos/sign-up.dto"
import { jwtConstants } from "./jwt.constants"

@Injectable()
export class AuthService {
  @Inject(JwtService)
  private readonly jwtService: JwtService

  @Inject(UserService)
  private readonly userService: UserService

  private isRefreshTokenValid(token: string | null | undefined): boolean {
    if (!token) return false

    try {
      return !!this.jwtService.verify(token)
    } catch {
      return false
    }
  }

  async verifyUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email)

    if (!user) {
      throw new NotFoundException("We could not find any user with that email")
    }

    if (!user.isActive) {
      throw new UnauthorizedException("User is not active")
    }

    const isPasswordValid = await bcrypt.compare(
      password ?? "",
      user.password ?? "",
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid password")
    }

    return user
  }

  async verifyGoogleUserOrCreate(
    providerId: string,
    profile: Profile,
    accessToken: string,
  ) {
    const user = await this.userService.findUserByProvider({
      provider: "google",
      providerId,
    })

    if (user) return user

    const userCreated = await this.userService.createUser({
      email: profile.emails?.[0]?.value,
      emailVerified: profile.emails?.[0]?.verified,
      isActive: true,
      password: null,
      provider: "google",
      providerId: profile.id,
      firstName: profile.name.familyName,
      lastName: profile.name.givenName,
      role: UserRole.Customer,
      metadata: {
        accessToken,
      },
      picture: profile.photos?.[0]?.value,
    })

    return userCreated
  }

  async login(user: UserEntity) {
    const authTokenPayload: AuthTokenPayload = new AuthTokenPayload({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    const authTokenPayloadPlainObject = { ...authTokenPayload }

    const accessToken = this.jwtService.sign(authTokenPayloadPlainObject)
    const refreshToken =
      user.refreshToken && this.isRefreshTokenValid(user.refreshToken)
        ? user.refreshToken
        : this.jwtService.sign(authTokenPayloadPlainObject, {
            expiresIn: jwtConstants.refreshExpiresIn,
          })

    // If the refresh token is not valid, we need to update it
    if (user.refreshToken !== refreshToken) {
      await this.userService.updateUser(user.id, {
        refreshToken,
      })
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: jwtConstants.expiresIn,
    }
  }

  async refresh(refreshToken: string) {
    let decoded: AuthTokenPayload | null = null

    try {
      decoded = this.jwtService.verify(refreshToken)
    } catch (error) {
      throw new BadRequestException(
        "Bad request! The refresh token is invalid or expired",
      )
    }

    if (!decoded) {
      throw new BadRequestException(
        "Bad request! The refresh token is invalid or expired",
      )
    }

    const user = await this.userService.findUserById(decoded.id)

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException("Invalid refresh token")
    }

    const payload = new AuthTokenPayload({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    const accessToken = this.jwtService.sign({ ...payload })

    return { accessToken, expiresIn: Number(jwtConstants.expiresIn) }
  }

  signup(payload: SignUpRequest) {
    return this.userService.createUser({
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      password: payload.password,
      role: UserRole.Customer,
      isActive: true,
    })
  }
}
