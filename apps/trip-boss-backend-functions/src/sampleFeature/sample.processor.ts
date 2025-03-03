import { Inject, Logger } from '@nestjs/common'
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { NatsJetStreamClientProxy } from '@repo/nestjs-nats-jetstream-transport'
import { firstValueFrom } from 'rxjs'

@Processor('sample-queue')
export class SampleProcessor extends WorkerHost {
  constructor(private natsClient: NatsJetStreamClientProxy) {
    super()
  }

  async process(job: Job<any, any, string>): Promise<any> {
    Logger.warn('[SampleProcessor] processing job', { job: job.name, data: job.data })

    this.natsClient.emit('test.event', 'test data').subscribe()

    const result = await firstValueFrom(this.natsClient.send('RPC.sample.test', 1))
    Logger.warn('[SampleProcessor] rpc result', { result })

    return 1
  }

  @OnWorkerEvent('completed')
  onCompleted() {
    Logger.warn('SampleProcessor completed')
  }
}
