import { Module } from '@nestjs/common'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

@Module({
  exports: ['AJV'],
})
export class AjvModule {
  static forRoot() {
    return {
      module: AjvModule,
      providers: [{
        provide: 'AJV',
        useValue: ajv,
      }],
      global: true,
    }
  }
}
