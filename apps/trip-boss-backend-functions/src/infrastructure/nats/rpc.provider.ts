import { Injectable, OnModuleInit } from '@nestjs/common'
import { CustomStrategy, ServerNats } from '@nestjs/microservices'
import { ConfigLoaderService } from '@repo/typed-config'
import { registerMicroservice } from '../microservices/initializer'
import { getNatsConfig } from './nats.config'

@Injectable()
export class NatsRpcProvider implements OnModuleInit {
  constructor(private readonly configLoader: ConfigLoaderService) {}

  onModuleInit() {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async onApplicationBootstrap() {
    const natsConfig = getNatsConfig(this.configLoader).Rpc
    const strategy: CustomStrategy = {
      strategy: new ServerNats(natsConfig),
    }

    registerMicroservice({ name: 'nats-rpc', microserviceOptions: strategy })
  }
}
