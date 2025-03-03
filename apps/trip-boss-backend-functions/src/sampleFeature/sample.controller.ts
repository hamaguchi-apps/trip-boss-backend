import { Controller, Get, Inject, Logger, NotFoundException, Param, Post } from '@nestjs/common'
import { BaseController } from '../infrastructure/baseController'
import { HealthIndicatorResult } from '@nestjs/terminus'
import { HealthService } from '../infrastructure/health/health.service'
import { InjectQueue, InjectFlowProducer } from '@nestjs/bullmq'
import { FlowProducer, Queue } from 'bullmq'
import { Ctx, MessagePattern, NatsContext } from '@nestjs/microservices'
import { EventPattern, Payload } from '@nestjs/microservices'
import { NatsJetStreamContext } from '@repo/nestjs-nats-jetstream-transport'
import { NATS_JETSTREAM_TRANSPORT } from '../infrastructure/nats/constants'
import { SampleService } from './sample.service'
import { NatsConsumerOptions } from './sample.nats'
import { getQueueToken } from '@nestjs/bullmq'
import { ModuleRef } from '@nestjs/core'


@Controller({ path: 'sample' })
export class SampleController extends BaseController {
  constructor(
    private readonly healthService: HealthService,
    private readonly sampleService: SampleService,
    @InjectQueue('sample-queue') private sampleQueue: Queue,
    @InjectFlowProducer('sample-flow') private sampleFlow: FlowProducer,
    private moduleRef: ModuleRef,
  ) {
    super()
    this.healthService.registerHealthCheck(this.isHealthy.bind(this))
  }

  override async isHealthy(): Promise<HealthIndicatorResult> {
    return this.getStatus('sample', true)
  }

  @Get('/add-job')
  async addJob(): Promise<any> {
    await this.sampleQueue.add('sample', {
      foo: 'bar',
    })

    return this.sampleQueue.getJobCounts()
  }

  @Get('/add-flow')
  async addFlow(): Promise<any> {
    await this.sampleFlow.add({
      name: 'root-job',
      queueName: '{sample-flow-queue}',
      data: {
        boss: true,
      },
      children: [
        {
          name: 'child-job',
          data: { idx: 1, foo: 'bar' },
          queueName: '{sample-flow-queue-children}',
        },
        {
          name: 'child-job-2',
          data: { idx: 2, foo: 'bang' },
          queueName: '{sample-flow-queue-children}',
        },
        {
          name: 'child-job-3',
          data: { idx: 3, foo: 'bang' },
          queueName: '{sample-flow-queue-children}',
        },
      ],
    })

    return this.sampleQueue.getJobCounts()
  }

  @Get('/jobs-sample')
  async getJobs(): Promise<any> {
    return await this.sampleQueue.getJobs()
  }

  @Get('/jobs/:queueName')
  async getJobsByQueueName(@Param('queueName') queueName: string): Promise<any> {
    try {
      const q = this.moduleRef.get<Queue>(getQueueToken(queueName), { strict: false })

      return await q.getJobs()
    }
    catch {
      return new NotFoundException(`Queue ${queueName} not found`)
    }
  }

  @Get('/custom-transaction-method')
  async customTransactionMethod(): Promise<string> {
    return await this.sampleService.customTransactionMethod()
  }

  @EventPattern('test.*', NATS_JETSTREAM_TRANSPORT, NatsConsumerOptions)
  public async testHandler(@Payload() data: string, @Ctx() context: NatsJetStreamContext) {
    context.message.ack()
    Logger.warn(`received: ${context.message.subject} - ${data}`, data)
  }

  @MessagePattern('RPC.sample.test', NATS_JETSTREAM_TRANSPORT, { queue: 'sample-queue' })
  public async testRpc(@Payload() data: number[], @Ctx() context: NatsContext) {
    Logger.warn(`rpc received: ${data}`, data)
    return new Date().toLocaleTimeString()
  }
}
