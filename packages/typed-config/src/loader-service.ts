import { Injectable, Logger } from '@nestjs/common'
import Convict from 'convict'
import dotenv from 'dotenv'
import path from 'path'
import { workspaceRootSync } from 'workspace-root'
import { TypedConfigService } from './service'

@Injectable()
export class ConfigLoaderService {
  private readonly logger = new Logger(ConfigLoaderService.name, { timestamp: true })

  constructor() {}

  load<T>(schema: Convict.Schema<T>) {
    const fileNames = [
      '.env',
      `${process.env.NODE_ENV}.env`,
    ]
    const root = workspaceRootSync() ?? ''

    const env = dotenv.config({
      path: fileNames.map(name => path.join(root, name)),
      debug: process.env.NODE_ENV !== 'production',
      encoding: 'utf8',
    })

    const config = Convict(schema)

    if (env?.parsed) {
      config.load(env.parsed)
    }

    config.validate({ allowed: 'warn', output: message => this.logger.warn(message) })

    return new TypedConfigService<T>(config)
  }
}
