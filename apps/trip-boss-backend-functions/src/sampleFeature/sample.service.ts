import { Injectable } from '@nestjs/common'

@Injectable()
export class SampleService {
  constructor(
  ) {}

  async customTransactionMethod(): Promise<string> {
    return ''
  }
}
