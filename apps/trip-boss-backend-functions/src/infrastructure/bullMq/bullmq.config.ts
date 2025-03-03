import { ConfigLoaderService } from '@repo/typed-config'
import * as Convict from 'convict'
import { QueueOptions } from 'bullmq'

export interface BullMqConfig {
  connection: {
    host: string
    port: number
  }
}

export const BullMqConfigSchema: Convict.Schema<BullMqConfig> = {
  connection: {
    host: {
      env: 'BULLMQ_CONNECTION_HOST',
      doc: 'DragonflyDb host',
      format: 'String',
      default: 'localhost',
      nullable: true,
    },
    port: {
      env: 'BULLMQ_CONNECTION_PORT',
      doc: 'DragonflyDb port',
      format: 'Number',
      default: 6379,
      nullable: true,
    },
  },
}

export const getBullMqConfig = (configLoader: ConfigLoaderService): QueueOptions => {
  const config = configLoader.load(BullMqConfigSchema)
  const bullMqConfig: QueueOptions = {
    connection: {
      host: config.get('connection.host'),
      port: config.get('connection.port'),
    },
  }
  return bullMqConfig
}
