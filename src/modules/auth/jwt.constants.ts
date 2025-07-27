import { configDotenv } from "dotenv"

configDotenv()

const secret = process.env.JWT_SECRET
const expiresIn = process.env.JWT_EXPIRES_IN
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN

export const jwtConstants = {
  secret,
  expiresIn,
  refreshExpiresIn,
}
