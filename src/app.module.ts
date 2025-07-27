import { ClassSerializerInterceptor, Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { AuthModule } from "./modules/auth/auth.module"
import { DatabaseModule } from "./database.module"
import { HealthModule } from "./modules/health/health.module"
import { UserModule } from "./modules/user/user.module"

@Module({
  imports: [DatabaseModule, UserModule, AuthModule, HealthModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
