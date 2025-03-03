import { Logger } from '@nestjs/common'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

@Processor('{sample-flow-queue}')
export class SampleFlowProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    Logger.warn('[SampleFlowProcessor] processing job', { job: job.name, data: job.data })
    return 1
  }
}

@Processor('{sample-flow-queue-children}')
export class SampleFlowChildrenProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    Logger.warn('[SampleFlowChildrenProcessor] processing job', { job: job.name, data: job.data })
    return 1
  }
}
