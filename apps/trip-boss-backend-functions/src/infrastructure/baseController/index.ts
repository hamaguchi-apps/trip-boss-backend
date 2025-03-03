import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus'
export abstract class BaseController extends HealthIndicator {
  constructor() {
    super()
  }

  abstract isHealthy(): Promise<HealthIndicatorResult>
}
