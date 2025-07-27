import { IsEmail, IsString, IsStrongPassword } from "class-validator"

export class LoginRequest {
  @IsString({ message: "Email is required" })
  @IsEmail({}, { message: "Email is not valid" })
  username: string

  @IsString({ message: "Password is required" })
  @IsStrongPassword({}, { message: "Password is not valid" })
  password: string
}
