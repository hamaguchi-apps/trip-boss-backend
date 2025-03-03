import { DynamicModule, Module } from '@nestjs/common'
import { ConfigLoaderService } from './loader-service'

@Module({
  providers: [ConfigLoaderService],
  exports: [ConfigLoaderService],
})
export class ConfigLoaderModule {
  static forRoot(entities = [], options?: any): DynamicModule {
    return {
      module: ConfigLoaderModule,
      global: true,
    }
  }
}
