import { MikroOrmModule } from '@mikro-orm/nestjs'
import { BullModule } from '@nestjs/bullmq'
import { INestApplication, Module, RequestMethod } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { TerminusModule } from '@nestjs/terminus'
import { NatsJetStreamTransport } from '@repo/nestjs-nats-jetstream-transport'
import { ConfigLoaderModule, ConfigLoaderService } from '@repo/typed-config'
import { GCPPubSubClient } from 'nestjs-gcp-pubsub'
import { LoggerModule } from 'nestjs-pino'
import { PinoConfig } from './app.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { getBullMqConfig } from './infrastructure/bullMq/bullmq.config'
import { getDatabaseConfig } from './infrastructure/database/database.config'
import { HealthController } from './infrastructure/health/health.controller'
import { HealthService } from './infrastructure/health/health.service'
import { NATS_RPC_TOKEN } from './infrastructure/nats/constants'
import { NatsJetStreamProvider } from './infrastructure/nats/jetstream.provider'
import { getNatsConfig } from './infrastructure/nats/nats.config'
import { NatsRpcProvider } from './infrastructure/nats/rpc.provider'

/* Feature Modules */
import { ItineraryGeneratorModule } from './itinerary-generator/itinerary-generator.module'
import { SampleModule } from './sampleFeature/sample.module'
import { ZitadelModule } from './zitadel/zitadel.module'

export class AppHost {
  app: INestApplication | undefined
}

@Module({
  imports: [
    LoggerModule.forRoot({
      exclude: [{ method: RequestMethod.ALL, path: 'health' }],
      pinoHttp: PinoConfig,
    }),
    TerminusModule,
    ConfigLoaderModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigLoaderModule],
      useFactory: (configLoader: ConfigLoaderService) => getBullMqConfig(configLoader),
      inject: [ConfigLoaderService],
    }),
    NatsJetStreamTransport.registerAsync({
      imports: [ConfigLoaderModule],
      useFactory: (configLoader: ConfigLoaderService) => getNatsConfig(configLoader).Jetstream,
      inject: [ConfigLoaderService],
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigLoaderModule],
      useFactory: (configLoader: ConfigLoaderService) => getDatabaseConfig(configLoader),
      inject: [ConfigLoaderService],
    }),
    ClientsModule.registerAsync([{
      imports: [ConfigLoaderModule],
      name: NATS_RPC_TOKEN,
      useFactory: (configService: ConfigLoaderService) => ({
        global: true,
        transport: Transport.NATS,
        options: {
          servers: getNatsConfig(configService).Rpc.servers,
        },
      }),
      inject: [ConfigLoaderService],
    }]),
    /* Feature Modules */
    SampleModule,
    ItineraryGeneratorModule,
    ZitadelModule,
  ],
  controllers: [
    AppController,
    HealthController,
  ],
  providers: [
    AppHost,
    AppService,
    HealthService,
    NatsJetStreamProvider,
    NatsRpcProvider,
  ],
  exports: [
    AppHost,
    AppModule,
    HealthService,
    BullModule,
    NatsJetStreamTransport,
    MikroOrmModule,
    ClientsModule,
  ],
})
export class AppModule { }
