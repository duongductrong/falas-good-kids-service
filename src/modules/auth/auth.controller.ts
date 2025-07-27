import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common"
import { Response } from "express"
import { omit } from "lodash"
import { ApiBuilder } from "src/shared/api"
import { milliseconds } from "@/utils/time"
import { UserEntity } from "../user/entities/user.entity"
import { AuthService } from "./auth.service"
import { CurrentUser, GoogleUser } from "./decorators/current-user.decorator"
import { RefreshTokenRequest } from "./dtos/refresh-token.dto"
import { SignUpRequest } from "./dtos/sign-up.dto"
import { GoogleAuthGuard } from "./guards/google-auth.guard"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"
import { LocalAuthGuard } from "./guards/local-auth.guard"
import { jwtConstants } from "./jwt.constants"

@Controller({
  path: "auth",
})
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService

  private withCredentials(
    response: Response,
    result: Awaited<ReturnType<typeof this.authService.login>>,
  ) {
    response.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: milliseconds(jwtConstants.expiresIn),
    })

    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: milliseconds(jwtConstants.refreshExpiresIn),
    })
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(user)

    this.withCredentials(response, result)

    return ApiBuilder.create()
      .setData(result)
      .setMessage("Login successful")
      .build()
  }

  @Post("signup")
  async signup(@Body() body: SignUpRequest) {
    const result = await this.authService.signup(body)

    return ApiBuilder.create()
      .setData(result)
      .setMessage("User created successfully")
      .build()
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async me(@CurrentUser() user: UserEntity) {
    return ApiBuilder.create()
      .setData(omit(user, ["refreshToken", "password"]))
      .setMessage("User fetched successfully")
      .build()
  }

  @Post("refresh-token")
  async refresh(@Body() body: RefreshTokenRequest) {
    const { refreshToken } = body

    const newAccessToken = await this.authService.refresh(refreshToken)

    return ApiBuilder.create()
      .setData({
        accessToken: newAccessToken,
      })
      .setMessage("Token refreshed successfully")
      .build()
  }

  @UseGuards(GoogleAuthGuard)
  @Get("/google")
  async google() {
    return ApiBuilder.create().setData({}).setMessage("Auth successful").build()
  }

  @UseGuards(GoogleAuthGuard)
  @Get("/callback/:providerId")
  async oauthCallback(
    @Param("providerId") providerId: string,
    @CurrentUser() user: GoogleUser,
    @Res() response: Response,
  ) {
    let actualUser: UserEntity | null = null

    if (user.provider === "google") {
      try {
        actualUser = await this.authService.verifyGoogleUserOrCreate(
          user.profile.id,
          user.profile,
          user.googleAccessToken,
        )
      } catch {
        throw new InternalServerErrorException(
          "Failed to verify or create Google user",
        )
      }
    }

    const result = await this.authService.login(actualUser)

    this.withCredentials(response, result)

    return ApiBuilder.create()
      .setData(result)
      .setMessage("Successfully authenticated with Google")
      .build()
  }
}
