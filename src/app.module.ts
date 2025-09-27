import { ClassSerializerInterceptor, Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { SlackModule } from "nestjs-slack-bolt"
import { LogLevel } from "@slack/web-api"
import { DatabaseModule } from "./database.module"
import { AuthModule } from "./modules/auth/auth.module"
import { HealthModule } from "./modules/health/health.module"
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module"
import { PersonModule } from "./modules/person/person.module"
import { UserModule } from "./modules/user/user.module"
import { VoteModule } from "./modules/vote/vote.module"

@Module({
  imports: [
    SlackModule.forRoot({
      logLevel: LogLevel.DEBUG,
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    HealthModule,
    PersonModule,
    VoteModule,
    LeaderboardModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
