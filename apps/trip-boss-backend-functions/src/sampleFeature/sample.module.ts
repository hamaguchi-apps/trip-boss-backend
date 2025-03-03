import { forwardRef, Module } from '@nestjs/common'
import { AppModule } from '../app.module'
import { SampleController } from './sample.controller'
import { BullModule } from '@nestjs/bullmq'
import { SampleProcessor } from './sample.processor'
import { SampleFlowChildrenProcessor, SampleFlowProcessor } from './sample-flow.processor'
import { initializeNatsStreams } from './sample.nats'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { SampleService } from './sample.service'
import { Entities } from '@repo/data-access'
import { ConfigLoaderModule } from '@repo/typed-config'

initializeNatsStreams()

@Module({
  imports: [
    ConfigLoaderModule,
    forwardRef(() => AppModule),
    forwardRef(() => BullModule),
    BullModule.registerQueue({
      name: 'sample-queue',
    }),
    BullModule.registerQueue({
      name: '{sample-flow-queue}',
    }),
    BullModule.registerQueue({
      name: '{sample-flow-queue-children}',
    }),
    BullModule.registerFlowProducer({
      name: 'sample-flow',
    }),
    forwardRef(() => MikroOrmModule),
    MikroOrmModule.forFeature([]),
  ],
  controllers: [SampleController],
  providers: [
    SampleProcessor,
    SampleFlowProcessor,
    SampleFlowChildrenProcessor,
    SampleService,
  ],
})
export class SampleModule { }
