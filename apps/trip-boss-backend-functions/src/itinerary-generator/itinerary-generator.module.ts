import { forwardRef, Module } from '@nestjs/common'
import { AppModule } from '../app.module'
import { ItineraryGeneratorController } from './itinerary-generator.controller'
import { BullModule } from '@nestjs/bullmq'
import { initializeNatsStreams } from './itinerary-generator.nats'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { ItineraryGeneratorService } from './itinerary-generator.service'
import { Entities } from '@repo/data-access'
import { ConfigLoaderModule } from '@repo/typed-config'

initializeNatsStreams()

@Module({
  imports: [
    ConfigLoaderModule,
    forwardRef(() => AppModule),
    forwardRef(() => BullModule),
    forwardRef(() => MikroOrmModule),
    MikroOrmModule.forFeature([Entities.Itinerary]),
  ],
  controllers: [ItineraryGeneratorController],
  providers: [ItineraryGeneratorService],
})
export class ItineraryGeneratorModule { }
