import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
} from "class-validator"

export class SignUpRequest {
  @IsString({ message: "Email is required" })
  @IsEmail({}, { message: "Email is not valid" })
  email: string

  @IsString({ message: "Password is required" })
  @IsStrongPassword({}, { message: "Password is not valid" })
  password: string

  @IsOptional()
  @IsString({ message: "First name is required" })
  firstName?: string

  @IsOptional()
  @IsString({ message: "Last name is required" })
  lastName?: string
}
