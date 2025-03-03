import { Injectable } from '@nestjs/common'
import { HealthIndicatorFunction } from '@nestjs/terminus'

@Injectable()
export class HealthService {
  private readonly healthCheckFunctions: HealthIndicatorFunction[] = []

  constructor() {}

  registerHealthCheck(healthCheck: HealthIndicatorFunction) {
    this.healthCheckFunctions.push(healthCheck)
  }

  getHealthCheckFunctions() {
    return this.healthCheckFunctions
  }
}
