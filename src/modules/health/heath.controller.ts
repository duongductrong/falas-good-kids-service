import { Controller, Get, Inject } from "@nestjs/common"
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus"

@Controller({
  path: "health",
})
export class HealthController {
  @Inject()
  private health: HealthCheckService

  @Inject()
  private http: HttpHealthIndicator

  @Inject()
  private db: TypeOrmHealthIndicator

  @Get("")
  @HealthCheck()
  check() {
    return this.health.check([() => this.db.pingCheck("database")])
  }
}
