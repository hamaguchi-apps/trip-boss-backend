import { Body, Controller, Post } from '@nestjs/common'
import { BaseController } from '../infrastructure/baseController'
import { HealthIndicatorResult } from '@nestjs/terminus'
import { HealthService } from '../infrastructure/health/health.service'
import { ModuleRef } from '@nestjs/core'
import { ZitadelService } from './zitadel.service'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { Queues } from './consts'
import { Logger } from '@nestjs/common'

@Controller({ path: '/zitadel' })
export class ZitadelController extends BaseController {
  private readonly logger = new Logger(ZitadelController.name)
  constructor(
    private readonly healthService: HealthService,
    private readonly zitadelService: ZitadelService,
    private moduleRef: ModuleRef,
    @InjectQueue(Queues.REFRESH_KEYS_JOB) private refreshKeysQueue: Queue,

  ) {
    super()
    this.healthService.registerHealthCheck(this.isHealthy.bind(this))
  }

  override async isHealthy(): Promise<HealthIndicatorResult> {
    const isHealthy = await this.zitadelService.isHealthy()
    return Promise.resolve(this.getStatus('zitadel', isHealthy))
  }

  @Post('/refresh-keys-job')
  async handleRefreshKeysJob(@Body() body: any): Promise<unknown> {
    this.logger.log({ message: 'Refresh keys job triggered', body })
    await this.refreshKeysQueue.add(Queues.REFRESH_KEYS_JOB, {})
    return this.refreshKeysQueue.getJobCounts()
  }
}
