import * as Convict from 'convict'
import { err } from 'pino-std-serializers'
export interface AppConfig {
  alive: boolean
}

export const AppConfigSchema: Convict.Schema<AppConfig> = {
  alive: {
    env: 'ALIVE',
    doc: 'If the environment is loaded then the app is alive. This is a sample configuration.',
    format: 'Boolean',
    default: false,
    nullable: true,
  },
}

export const PinoConfig = process.env.NODE_ENV === 'production'
  ? {
      level: 'debug',
      serializers: {
        err,
      },
    }
  : {
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: true,
          ignore: 'pid,req.headers.cookie,req.headers.accept,req.headers.user-agent',
        },
      },
      serializers: {
        err,
      },
    }

