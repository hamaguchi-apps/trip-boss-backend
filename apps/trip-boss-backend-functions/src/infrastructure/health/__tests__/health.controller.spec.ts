import { Test, TestingModule } from '@nestjs/testing'
import { HealthController } from '../health.controller'
import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus'
import { HealthService } from '../health.service'

describe('HealthController', () => {
  let controller: HealthController
  let healthCheckService: jest.Mocked<HealthCheckService>
  let healthService: jest.Mocked<HealthService>

  beforeEach(async () => {
    const mockHealthCheckService = {
      check: jest.fn(),
    }

    const mockHealthService = {
      getHealthCheckFunctions: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: HealthService, useValue: mockHealthService },
      ],
    }).compile()

    controller = module.get<HealthController>(HealthController)
    healthCheckService = module.get(HealthCheckService)
    healthService = module.get(HealthService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('healthCheck', () => {
    it('should call health.check with health check functions from healthService', async () => {
      const mockHealthCheckFunctions = [
        jest.fn(),
        jest.fn(),
      ]
      healthService.getHealthCheckFunctions.mockReturnValue(mockHealthCheckFunctions)

      const mockHealthCheckResult = { status: 'ok' }
      healthCheckService.check.mockResolvedValue(mockHealthCheckResult as HealthCheckResult)

      const result = await controller.healthCheck()

      expect(healthService.getHealthCheckFunctions).toHaveBeenCalled()
      expect(healthCheckService.check).toHaveBeenCalledWith(mockHealthCheckFunctions)
      expect(result).toEqual(mockHealthCheckResult)
    })
  })
})
