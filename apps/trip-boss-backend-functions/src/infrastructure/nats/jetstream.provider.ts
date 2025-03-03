import { Injectable, OnModuleInit } from '@nestjs/common'
import { CustomStrategy } from '@nestjs/microservices'
import { ConfigLoaderService } from '@repo/typed-config'
import { NatsJetStreamServer } from '@repo/nestjs-nats-jetstream-transport'
import { registerMicroservice } from '../microservices/initializer'
import { getNatsConfig } from './nats.config'
import { getNatsStreams } from './registerNatsStreams'

@Injectable()
export class NatsJetStreamProvider implements OnModuleInit {
  constructor(private readonly configLoader: ConfigLoaderService) {}

  onModuleInit() {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async onApplicationBootstrap() {
    const natsConfig = getNatsConfig(this.configLoader)

    const strategy: CustomStrategy = {
      strategy: new NatsJetStreamServer({
        connectionOptions: {
          name: natsConfig.Jetstream.connectionOptions.name as string,
          servers: natsConfig.Jetstream.connectionOptions.servers,
        },
        consumerOptions: {
          durable: 'trip-boss-backend-functions',
          deliverTo: 'trip-boss-backend-functions',
        },
        streamConfig: getNatsStreams(),
      }),
    }

    registerMicroservice({ name: 'nats-rpc', microserviceOptions: strategy })
  }
}
