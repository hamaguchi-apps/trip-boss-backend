import type { Config, ZitadelModuleOptions } from './interfaces'
import { DynamicModule, Global, Module, Provider } from '@nestjs/common'
import { ZitadelService } from './service'

@Global()
@Module({})
export class ZitadelModule {
  public static forRoot(options: ZitadelModuleOptions): DynamicModule {
    if (!options.useFactory) {
      throw new Error('useFactory must be provided in ZitadelModuleOptions')
    }

    return {
      module: ZitadelModule,
      providers: createZitadelProviders(options),
      exports: [ZITADEL_MODULE_SERVICE],
    }
  }
}

const createZitadelProviders = (options: ZitadelModuleOptions): Provider[] => [
  {
    provide: ZITADEL_MODULE_CONFIG,
    useFactory: options.useFactory,
    inject: options.inject || [],
  },
  {
    inject: [ZITADEL_MODULE_CONFIG],
    useFactory: (config: Config) => new ZitadelService(config),
    provide: ZITADEL_MODULE_SERVICE,
  },
]

export const ZITADEL_MODULE_SERVICE = 'ZitadelModuleService'
export const ZITADEL_MODULE_CONFIG = 'ZitadelModuleConfig'
