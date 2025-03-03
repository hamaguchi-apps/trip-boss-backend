import { Test, TestingModule } from '@nestjs/testing'
import { HealthService } from '../health.service'
import { HealthIndicatorFunction } from '@nestjs/terminus'

describe('HealthService', () => {
  let service: HealthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile()

    service = module.get<HealthService>(HealthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('registerHealthCheck', () => {
    it('should register a health check function', () => {
      const mockHealthCheck: HealthIndicatorFunction = jest.fn()
      service.registerHealthCheck(mockHealthCheck)
      expect(service.getHealthCheckFunctions()).toContain(mockHealthCheck)
    })
  })

  describe('getHealthCheckFunctions', () => {
    it('should return all registered health check functions', () => {
      const mockHealthCheck1: HealthIndicatorFunction = jest.fn()
      const mockHealthCheck2: HealthIndicatorFunction = jest.fn()

      service.registerHealthCheck(mockHealthCheck1)
      service.registerHealthCheck(mockHealthCheck2)

      const healthChecks = service.getHealthCheckFunctions()
      expect(healthChecks).toHaveLength(2)
      expect(healthChecks).toContain(mockHealthCheck1)
      expect(healthChecks).toContain(mockHealthCheck2)
    })

    it('should return an empty array when no health checks are registered', () => {
      expect(service.getHealthCheckFunctions()).toEqual([])
    })
  })
})
