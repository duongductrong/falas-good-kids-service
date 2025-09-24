import { ClassSerializerInterceptor, Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { DatabaseModule } from "./database.module"
import { AuthModule } from "./modules/auth/auth.module"
import { HealthModule } from "./modules/health/health.module"
import { HonorModule } from "./modules/honor/honor.module"
import { SlackModule } from "./modules/slack/slack.module"
import { UserModule } from "./modules/user/user.module"

@Module({
  imports: [
    SlackModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    HealthModule,
    HonorModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
