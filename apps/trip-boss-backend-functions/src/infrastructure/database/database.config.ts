import { Connection, IDatabaseDriver, LoggerNamespace } from '@mikro-orm/core'
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { Entities, Repository } from '@repo/data-access'
import { ConfigLoaderService } from '@repo/typed-config'
import * as Convict from 'convict'

export interface DatabaseConfig {
  connection: {
    read: {
      clientUrl: string
    }
    write: {
      clientUrl: string
    }
    ssl: boolean
  }
}

export const DatabaseConfigSchema: Convict.Schema<DatabaseConfig> = {
  connection: {
    read: {
      clientUrl: {
        env: 'DATABASE_READ_URL',
        doc: 'Database read client url',
        format: 'String',
        default: null,
        nullable: true,
      },
    },
    write: {
      clientUrl: {
        env: 'DATABASE_WRITE_URL',
        doc: 'Database write client url',
        format: 'String',
        default: 'postgresql://postgres:secretpgpassword@localhost:5434/postgres',
      },
    },
    ssl: {
      env: 'DATABASE_SSL',
      doc: 'Database ssl',
      format: 'Boolean',
      default: false,
    },
  },
}

export const getDatabaseConfig = (
  configLoader: ConfigLoaderService,
): Omit<MikroOrmModuleOptions<IDatabaseDriver<Connection>>, 'contextName'> => {
  const config = configLoader.load(DatabaseConfigSchema)

  const readReplicas = config.get('connection.read.clientUrl') !== null ? [{ clientUrl: config.get('connection.read.clientUrl') }] : []

  const ssl = config.get('connection.ssl') ? { rejectUnauthorized: false } : false

  const debug: LoggerNamespace[] | boolean = []

  // Ref: https://mikro-orm.io/docs/configuration
  const databaseConfig: MikroOrmModuleOptions<IDatabaseDriver<Connection>> = {
    debug,
    entities: Object.values(Entities),
    entityRepository: Repository,
    driver: PostgreSqlDriver,
    driverOptions: { connection: { ssl, timezone: '-03:00' } },
    clientUrl: config.get('connection.write.clientUrl'),
    replicas: readReplicas,
    preferReadReplicas: readReplicas.length > 0,
    pool: { min: 5, max: 30 },
    strict: true,
    name: 'trip-boss-backend-functions',
  }

  return databaseConfig
}
