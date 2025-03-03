import { forwardRef, Module } from '@nestjs/common'
import { ConfigLoaderModule, ConfigLoaderService } from '@repo/typed-config'
import { ZitadelModule as ZitadelModuleImport } from '@repo/zitadel'
import { AppModule } from '../app.module'
import { ZitadelController } from './zitadel.controller'
import { ZitadelService } from './zitadel.service'

import { getZitadelConfig } from './config'
import { Queues } from './consts'
import { BullModule } from '@nestjs/bullmq'
import { ZitadelProcessor } from './zitadel.processor'
@Module({
  imports: [
    forwardRef(() => AppModule),
    ConfigLoaderModule.forRoot(),
    BullModule.registerQueue({
      name: Queues.REFRESH_KEYS_JOB,
    }),
    ZitadelModuleImport.forRoot({
      inject: [ConfigLoaderService],
      useFactory: (configLoader: ConfigLoaderService) => getZitadelConfig(configLoader),
    }),
  ],
  controllers: [ZitadelController],
  providers: [
    ZitadelService,
    ZitadelProcessor,
  ],
})
export class ZitadelModule { }
