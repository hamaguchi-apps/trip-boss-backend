import { Controller, Post, Body } from '@nestjs/common'
import { BaseController } from '../infrastructure/baseController'
import { HealthIndicatorResult } from '@nestjs/terminus'
import { HealthService } from '../infrastructure/health/health.service'
import { ItineraryGeneratorService } from './itinerary-generator.service'
import { ModuleRef } from '@nestjs/core'


@Controller({ path: 'itinerary-generator' })
export class ItineraryGeneratorController extends BaseController {
  constructor(
    private readonly healthService: HealthService,
    private readonly itineraryGeneratorService: ItineraryGeneratorService,
    private moduleRef: ModuleRef,
  ) {
    super()
    this.healthService.registerHealthCheck(this.isHealthy.bind(this))
  }

  override async isHealthy(): Promise<HealthIndicatorResult> {
    return this.getStatus('itinerary-generator', true)
  }

  @Post('/')
  async getItinerary(@Body() body: { origin: string, destination: string, departureDate: string, arrivalDate: string }): Promise<any> {
    return await this.itineraryGeneratorService.getItinerary(body.origin, body.destination, body.departureDate, body.arrivalDate)
  }
}
