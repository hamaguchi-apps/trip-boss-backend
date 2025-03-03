import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { ZitadelService } from './zitadel.service'

import type { Job, Queue } from 'bullmq'
import { Queues } from './consts'
import { getZitadelConfig } from './config'
import { ConfigLoaderService } from '@repo/typed-config'
import { setupJobScheduler } from '../utils/job'

@Processor(Queues.REFRESH_KEYS_JOB)
export class ZitadelProcessor extends WorkerHost {
  private readonly logger: Logger
  constructor(
    @InjectQueue(Queues.REFRESH_KEYS_JOB) private refreshKeysQueue: Queue,
    private readonly service: ZitadelService,
    private readonly configLoader: ConfigLoaderService,
  ) {
    super()
    this.logger = new Logger(ZitadelProcessor.name, { timestamp: true })
    this.setup()
  }

  /**
   *  Will be called by the bullmq library
   */
  async process(job: Job<any>) {
    this.logger.debug({ message: 'Processing refresh keys job', jobData: job.data })
    return this.handler(job)
  }

  async handler(job: Job<any>): Promise<number> {
    await this.service.refreshKeys()
    this.logger.log({ message: 'Keys refreshed' })

    return 1
  }

  private setup() {
    const jobConfig = getZitadelConfig(this.configLoader).refreshKeysJob
    setupJobScheduler(this.refreshKeysQueue, 'refresh-keys', jobConfig, this.logger)
  }
}
