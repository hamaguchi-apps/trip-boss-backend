import { NatsJetStreamClientOptions } from '@repo/nestjs-nats-jetstream-transport'
import { ConfigLoaderService } from '@repo/typed-config'
import * as Convict from 'convict'
import { ConnectionOptions } from 'nats'

export interface NatsConfig {
  connection: {
    servers: string
  }
}

export const NatsConfigSchema: Convict.Schema<NatsConfig> = {
  connection: {
    servers: {
      env: 'NATS_CONNECTION_SERVERS',
      doc: 'Nats servers',
      format: 'String',
      default: 'localhost:4222',
    },
  },
}

export const getNatsConfig = (configLoader: ConfigLoaderService): { Jetstream: NatsJetStreamClientOptions, Rpc: ConnectionOptions } => {
  const config = configLoader.load(NatsConfigSchema)
  const natsJetStreamConfig: NatsJetStreamClientOptions = {
    connectionOptions: {
      name: 'backend-functions',
      servers: config.get('connection.servers'),
    },
  }
  const natsConnectionConfig: ConnectionOptions = {
    name: 'backend-functions-rpc',
    servers: config.get('connection.servers'),
  }
  return { Jetstream: natsJetStreamConfig, Rpc: natsConnectionConfig }
}

