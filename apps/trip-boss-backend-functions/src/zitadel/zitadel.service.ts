import { Inject, Injectable, Logger } from '@nestjs/common'
import { ZITADEL_MODULE_SERVICE, ZitadelService as ZitadelServiceImport } from '@repo/zitadel'

@Injectable()
export class ZitadelService {
  private readonly logger: Logger

  constructor(
    @Inject(ZITADEL_MODULE_SERVICE) private readonly zitadelService: ZitadelServiceImport,
  ) {
    this.logger = new Logger(ZitadelService.name, { timestamp: true })
  }

  async isHealthy(): Promise<boolean> {
    return this.zitadelService.isHealthy()
  }

  async refreshKeys(): Promise<void> {
    const resp = await this.zitadelService.refreshKeys()
    this.logger.log({ message: 'Keys refreshed', resp })
  }
}
