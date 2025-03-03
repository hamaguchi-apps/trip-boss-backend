import { ConfigLoaderService } from '../loader-service'
import Convict from 'convict'
import dotenv from 'dotenv'
import path from 'path'
import { workspaceRootSync } from 'workspace-root'

interface TestConfigSchema {
  port?: number
  name?: string
}

// Mock external dependencies
jest.mock('dotenv')
jest.mock('workspace-root')

describe('ConfigLoaderService', () => {
  let service: ConfigLoaderService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new ConfigLoaderService();

    // Mock workspace root
    (workspaceRootSync as jest.Mock).mockReturnValue('/fake/root/path')
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should load configuration with schema', () => {
    // Define a test schema
    const schema: Convict.Schema<TestConfigSchema> = {
      port: {
        doc: 'The port to bind.',
        format: 'port',
        default: 8080,
        env: 'PORT',
      },
    }

    const result = service.load<TestConfigSchema>(schema)

    // Verify dotenv was called with correct path
    expect(dotenv.config).toHaveBeenCalledWith({
      path: [
        '/fake/root/path/.env'.replace(/\//g, path.sep),
        '/fake/root/path/test.env'.replace(/\//g, path.sep),
      ],
      encoding: 'utf8',
      debug: true,
    })

    // Verify the returned service is correct
    expect(result).toBeDefined()
    expect(result.get('port')).toBe(8080)
  })

  it('should validate schema on load', () => {
    const schema: Convict.Schema<TestConfigSchema> = {
      name: {
        doc: 'The application name',
        format: String,
        default: null,
        nullable: false,
      },
    }

    expect(() => service.load<TestConfigSchema>(schema)).toThrow()
  })
})
