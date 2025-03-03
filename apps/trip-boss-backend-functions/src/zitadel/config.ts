import { ConfigLoaderService } from '@repo/typed-config'
import { Config } from '@repo/zitadel'
import * as Convict from 'convict'


export interface ZitadelJobConfig {
  refreshKeysJob: {
    cron: string
    every: number
  }
}

export const ZitadelConfigSchema: Convict.Schema<Config & ZitadelJobConfig> = {
  baseUrl: {
    env: 'ZITADEL_BASE_URL',
    doc: 'Zitadel base url',
    format: 'String',
    default: 'http://localhost:8082',
  },
  pat: {
    env: 'ZITADEL_PAT',
    doc: 'Zitadel PAT',
    format: 'String',
    default: 'wj-wzq_-_Fkm7MWFQSi0QoRzpRCTKA-iw5o67ARv43rtTM3umNLQ5gHqE-mGbTV4ah8L4ZM',
  },
  refreshKeysJob: {
    cron: {
      env: 'ZITADEL_REFRESH_KEYS_JOB_CRON',
      doc: 'Zitadel refresh keys job cron',
      format: 'String',
      default: '0 0 1 * * *',
      nullable: true,
    },
    every: {
      env: 'ZITADEL_REFRESH_KEYS_JOB_EVERY',
      doc: 'Zitadel refresh keys job every',
      format: 'Number',
      default: null,
      nullable: true,
    },
  },
}


export function getZitadelConfig(configLoader: ConfigLoaderService): Config & ZitadelJobConfig {
  const config = configLoader.load<Config & ZitadelJobConfig>(ZitadelConfigSchema)

  const baseUrl = config.get('baseUrl')
  const pat = config.get('pat')
  const refreshKeysJob = {
    cron: config.get('refreshKeysJob.cron'),
    every: config.get('refreshKeysJob.every'),
  }

  return { baseUrl, pat, refreshKeysJob }
}

