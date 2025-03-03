import { TypedConfigService } from '../service'
import Convict from 'convict'

export interface TestConfigSchema {
  database: {
    host: string
    port: number
    name: string
  }
}

describe('TypedConfigService', () => {
  let service: TypedConfigService<TestConfigSchema>
  let mockConfig: Convict.Config<TestConfigSchema>

  beforeEach(() => {
    // Create a test schema
    const schema = {
      database: {
        host: {
          doc: 'Database host name/IP',
          format: String,
          default: 'localhost',
        },
        port: {
          doc: 'Database port',
          format: 'port',
          default: 5432,
        },
        name: {
          doc: 'Database name',
          format: String,
          default: 'db',
        },
      },
    }

    mockConfig = Convict(schema)
    service = new TypedConfigService(mockConfig)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should get simple property value', () => {
    expect(service.get('database.host')).toBe('localhost')
    expect(service.get('database.port')).toBe(5432)
  })

  it('should get nested property value', () => {
    const dbConfig = {
      host: 'localhost',
      port: 5432,
      name: 'db',
    }

    // Mock the get method to return our test object
    jest.spyOn(mockConfig, 'get').mockReturnValueOnce(dbConfig)
    expect(service.get('database')).toEqual(dbConfig)
  })

  it('should maintain type safety', () => {
    const port: number = service.get('database.port')
    const host: string = service.get('database.host')

    expect(typeof port).toBe('number')
    expect(typeof host).toBe('string')
  })
})
