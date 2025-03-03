import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { BaseController } from './infrastructure/baseController'
import { HealthIndicatorResult } from '@nestjs/terminus'
import { HealthService } from './infrastructure/health/health.service'
import { ConfigLoaderService, TypedConfigService } from '@repo/typed-config'
import { AppConfig, AppConfigSchema } from './app.config'

@Controller()
export class AppController extends BaseController {
  private readonly configService: TypedConfigService<AppConfig>

  constructor(
    private readonly appService: AppService,
    private readonly healthService: HealthService,
    private readonly configLoader: ConfigLoaderService,
  ) {
    super()
    this.healthService.registerHealthCheck(this.isHealthy.bind(this))
    this.configService = this.configLoader.load(AppConfigSchema)
  }

  override async isHealthy(): Promise<HealthIndicatorResult> {
    return this.getStatus('app', this.configService.get('alive'))
  }

  @Get('/ping')
  ping(): string {
    return this.appService.ping()
  }
}
