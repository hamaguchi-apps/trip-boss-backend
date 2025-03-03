import { HealthCheck, HealthCheckService } from '@nestjs/terminus'
import { Controller, Get } from '@nestjs/common'
import { HealthService } from './health.service'

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private healthService: HealthService,
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check(this.healthService.getHealthCheckFunctions())
  }
}
